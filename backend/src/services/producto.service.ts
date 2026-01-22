import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateProductoDto {
  codigo: string;
  nombre: string;
  categoriaId: string;
  unidadMedidaId: string;
  stockMinimo: number;
  stockActual: number;
  perecedero: boolean;
  fechaVencimiento?: Date;
  descripcion?: string;
}

interface UpdateProductoDto {
  codigo?: string;
  nombre?: string;
  categoriaId?: string;
  unidadMedidaId?: string;
  stockMinimo?: number;
  stockActual?: number;
  perecedero?: boolean;
  fechaVencimiento?: Date;
  descripcion?: string;
  activo?: boolean;
}

export const productoService = {
  async findAll(includeInactive = false, categoriaId?: string, search?: string) {
    const where: any = includeInactive ? {} : { activo: true };
    
    if (categoriaId) {
      where.categoriaId = categoriaId;
    }
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { codigo: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const productos = await prisma.producto.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        categoria: true,
        unidadMedida: true,
        movimientos: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
        _count: {
          select: { 
            movimientos: true,
            kitProductos: true,
          },
        },
      },
    });

    return productos.map((p: any) => ({
      ...p,
      stockStatus: this.getStockStatus(p.stockActual, p.stockMinimo),
      movimientosCount: p._count.movimientos,
      kitsCount: p._count.kitProductos,
    }));
  },

  async findById(id: string) {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        unidadMedida: true,
        movimientos: {
          orderBy: { fecha: 'desc' },
          include: {
            bodega: true,
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
            kitProductos: true,
          },
        },
      },
    });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    return {
      ...producto,
      stockStatus: this.getStockStatus(producto.stockActual, producto.stockMinimo),
      movimientosCount: producto._count.movimientos,
      kitsCount: producto._count.kitProductos,
    };
  },

  async create(data: CreateProductoDto) {
    // Verificar código único
    const existing = await prisma.producto.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new AppError('Ya existe un producto con ese código', 400);
    }

    // Verificar que categoría y unidad existan
    const categoria = await prisma.categoriaProducto.findUnique({
      where: { id: data.categoriaId },
    });

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 400);
    }

    const unidadMedida = await prisma.unidadMedida.findUnique({
      where: { id: data.unidadMedidaId },
    });

    if (!unidadMedida) {
      throw new AppError('Unidad de medida no encontrada', 400);
    }

    const producto = await prisma.producto.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        categoriaId: data.categoriaId,
        unidadMedidaId: data.unidadMedidaId,
        stockMinimo: data.stockMinimo,
        stockActual: data.stockActual,
        perecedero: data.perecedero,
        fechaVencimiento: data.fechaVencimiento,
        descripcion: data.descripcion,
      },
      include: {
        categoria: true,
        unidadMedida: true,
      },
    });

    // Crear movimiento inicial si hay stock
    if (data.stockActual > 0) {
      await prisma.movimiento.create({
        data: {
          tipo: 'entrada',
          productoId: producto.id,
          bodegaId: 'default-bodega', // TODO: Implementar bodega por defecto
          cantidad: data.stockActual,
          observaciones: 'Stock inicial',
          registradoPorId: 'admin-user', // TODO: Obtener del token
        },
      });
    }

    return {
      ...producto,
      stockStatus: this.getStockStatus(producto.stockActual, producto.stockMinimo),
    };
  },

  async update(id: string, data: UpdateProductoDto) {
    const producto = await prisma.producto.findUnique({ where: { id } });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    // Verificar código único si se está actualizando
    if (data.codigo && data.codigo !== producto.codigo) {
      const existing = await prisma.producto.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new AppError('Ya existe un producto con ese código', 400);
      }
    }

    // Verificar relaciones si se están actualizando
    if (data.categoriaId) {
      const categoria = await prisma.categoriaProducto.findUnique({
        where: { id: data.categoriaId },
      });
      if (!categoria) {
        throw new AppError('Categoría no encontrada', 400);
      }
    }

    if (data.unidadMedidaId) {
      const unidadMedida = await prisma.unidadMedida.findUnique({
        where: { id: data.unidadMedidaId },
      });
      if (!unidadMedida) {
        throw new AppError('Unidad de medida no encontrada', 400);
      }
    }

    const updated = await prisma.producto.update({
      where: { id },
      data,
      include: {
        categoria: true,
        unidadMedida: true,
      },
    });

    return {
      ...updated,
      stockStatus: this.getStockStatus(updated.stockActual, updated.stockMinimo),
    };
  },

  async delete(id: string) {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: { 
        _count: { 
          select: { 
            movimientos: true,
            kitProductos: true,
          },
        },
      },
    });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    if (producto._count.movimientos > 0 || producto._count.kitProductos > 0) {
      throw new AppError('No se puede eliminar un producto con movimientos o kits asociados', 400);
    }

    await prisma.producto.delete({ where: { id } });

    return { message: 'Producto eliminado correctamente' };
  },

  async toggleActive(id: string) {
    const producto = await prisma.producto.findUnique({ where: { id } });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    const updated = await prisma.producto.update({
      where: { id },
      data: { activo: !producto.activo },
      include: {
        categoria: true,
        unidadMedida: true,
      },
    });

    return {
      message: `Producto ${updated.activo ? 'activado' : 'desactivado'} correctamente`,
      producto: {
        ...updated,
        stockStatus: this.getStockStatus(updated.stockActual, updated.stockMinimo),
      },
    };
  },

  async adjustStock(id: string, cantidad: number, tipo: 'entrada' | 'salida', bodegaId: string, observaciones?: string) {
    const producto = await prisma.producto.findUnique({ where: { id } });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    const nuevoStock = tipo === 'entrada' 
      ? producto.stockActual + cantidad 
      : producto.stockActual - cantidad;

    if (nuevoStock < 0) {
      throw new AppError('Stock insuficiente para esta salida', 400);
    }

    // Actualizar stock del producto
    await prisma.producto.update({
      where: { id },
      data: { stockActual: nuevoStock },
    });

    // Crear movimiento
    const movimiento = await prisma.movimiento.create({
      data: {
        tipo,
        productoId: id,
        bodegaId,
        cantidad,
        observaciones: observaciones || `${tipo} de stock`,
        registradoPorId: 'admin-user', // TODO: Obtener del token
      },
      include: {
        producto: {
          include: {
            categoria: true,
            unidadMedida: true,
          },
        },
        bodega: true,
      },
    });

    return {
      message: `Stock ajustado correctamente. Nuevo stock: ${nuevoStock}`,
      movimiento,
    };
  },

  getStockStatus(stockActual: number, stockMinimo: number): string {
    if (stockActual === 0) return 'agotado';
    if (stockActual <= stockMinimo) return 'bajo';
    if (stockActual <= stockMinimo * 1.5) return 'medio';
    return 'optimo';
  },
};
