import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateBodegaDto {
  codigo: string;
  nombre: string;
  direccion: string;
  capacidad?: number;
  responsableNombre: string;
  responsableEmail: string;
  responsableCelular: string;
}

interface UpdateBodegaDto {
  codigo?: string;
  nombre?: string;
  direccion?: string;
  capacidad?: number;
  responsableNombre?: string;
  responsableEmail?: string;
  responsableCelular?: string;
  activo?: boolean;
}

export const bodegaService = {
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { activo: true };
    
    const bodegas = await prisma.bodega.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        movimientos: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
        _count: {
          select: { 
            movimientos: true,
          },
        },
      },
    });

    return bodegas.map((b: any) => ({
      ...b,
      movimientosCount: b._count.movimientos,
      capacidadUtilizada: b.capacidad ? Math.round((b._count.movimientos / b.capacidad) * 100) : null,
    }));
  },

  async findById(id: string) {
    const bodega = await prisma.bodega.findUnique({
      where: { id },
      include: {
        movimientos: {
          orderBy: { fecha: 'desc' },
          include: {
            producto: {
              include: {
                categoria: true,
                unidadMedida: true,
              },
            },
            registradoPor: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
        _count: {
          select: { 
            movimientos: true,
          },
        },
      },
    });

    if (!bodega) {
      throw new AppError('Bodega no encontrada', 404);
    }

    return {
      ...bodega,
      movimientosCount: bodega._count.movimientos,
      capacidadUtilizada: bodega.capacidad ? Math.round((bodega._count.movimientos / bodega.capacidad) * 100) : null,
    };
  },

  async create(data: CreateBodegaDto) {
    // Verificar código único
    const existing = await prisma.bodega.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new AppError('Ya existe una bodega con ese código', 400);
    }

    const bodega = await prisma.bodega.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        direccion: data.direccion,
        capacidad: data.capacidad,
        responsableNombre: data.responsableNombre,
        responsableEmail: data.responsableEmail,
        responsableCelular: data.responsableCelular,
      },
    });

    return bodega;
  },

  async update(id: string, data: UpdateBodegaDto) {
    const bodega = await prisma.bodega.findUnique({ where: { id } });

    if (!bodega) {
      throw new AppError('Bodega no encontrada', 404);
    }

    // Verificar código único si se está actualizando
    if (data.codigo && data.codigo !== bodega.codigo) {
      const existing = await prisma.bodega.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new AppError('Ya existe una bodega con ese código', 400);
      }
    }

    const updated = await prisma.bodega.update({
      where: { id },
      data,
    });

    return updated;
  },

  async delete(id: string) {
    const bodega = await prisma.bodega.findUnique({
      where: { id },
      include: { 
        _count: { 
          select: { 
            movimientos: true,
          },
        },
      },
    });

    if (!bodega) {
      throw new AppError('Bodega no encontrada', 404);
    }

    if (bodega._count.movimientos > 0) {
      throw new AppError('No se puede eliminar una bodega con movimientos asociados', 400);
    }

    await prisma.bodega.delete({ where: { id } });

    return { message: 'Bodega eliminada correctamente' };
  },

  async toggleActive(id: string) {
    const bodega = await prisma.bodega.findUnique({ where: { id } });

    if (!bodega) {
      throw new AppError('Bodega no encontrada', 404);
    }

    const updated = await prisma.bodega.update({
      where: { id },
      data: { activo: !bodega.activo },
    });

    return {
      message: `Bodega ${updated.activo ? 'activada' : 'desactivada'} correctamente`,
      bodega: updated,
    };
  },

  async getStockPorBodega(id: string) {
    const bodega = await prisma.bodega.findUnique({ where: { id } });

    if (!bodega) {
      throw new AppError('Bodega no encontrada', 404);
    }

    // Obtener movimientos agrupados por producto
    const movimientos = await prisma.movimiento.groupBy({
      by: ['productoId'],
      where: { bodegaId: id },
      _sum: {
        cantidad: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
    });

    // Obtener detalles de los productos
    const productosIds = movimientos.map(m => m.productoId);
    const productos = await prisma.producto.findMany({
      where: { id: { in: productosIds } },
      include: {
        categoria: true,
        unidadMedida: true,
      },
    });

    const stockPorProducto = movimientos.map(mov => {
      const producto = productos.find(p => p.id === mov.productoId);
      const cantidadTotal = mov._sum.cantidad || 0;
      
      // Calcular entradas y salidas
      const entradas = Math.max(0, cantidadTotal);
      const salidas = Math.abs(Math.min(0, cantidadTotal));
      const stockActual = entradas - salidas;

      return {
        producto: producto || null,
        stockActual,
        entradas,
        salidas,
      };
    }).filter(item => item.producto && item.stockActual > 0);

    return {
      bodega,
      stockPorProducto,
    };
  },
};
