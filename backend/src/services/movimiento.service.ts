import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateMovimientoDto {
  tipo: string;
  productoId: string;
  bodegaId: string;
  cantidad: number;
  observaciones?: string;
}

interface FindMovimientosDto {
  tipo?: string;
  productoId?: string;
  bodegaId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

export const movimientoService = {
  async findAll(filters: FindMovimientosDto = {}) {
    const where: any = {};
    
    if (filters.tipo) {
      where.tipo = filters.tipo;
    }
    
    if (filters.productoId) {
      where.productoId = filters.productoId;
    }
    
    if (filters.bodegaId) {
      where.bodegaId = filters.bodegaId;
    }
    
    if (filters.fechaInicio || filters.fechaFin) {
      where.fecha = {};
      if (filters.fechaInicio) {
        where.fecha.gte = filters.fechaInicio;
      }
      if (filters.fechaFin) {
        where.fecha.lte = filters.fechaFin;
      }
    }
    
    const movimientos = await prisma.movimiento.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        producto: {
          include: {
            categoria: true,
            unidadMedida: true,
          },
        },
        bodega: true,
        registradoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    return movimientos;
  },

  async findById(id: string) {
    const movimiento = await prisma.movimiento.findUnique({
      where: { id },
      include: {
        producto: {
          include: {
            categoria: true,
            unidadMedida: true,
          },
        },
        bodega: true,
        registradoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    if (!movimiento) {
      throw new AppError('Movimiento no encontrado', 404);
    }

    return movimiento;
  },

  async create(data: CreateMovimientoDto, registradoPorId: string) {
    // Verificar que el producto exista
    const producto = await prisma.producto.findUnique({
      where: { id: data.productoId },
    });

    if (!producto) {
      throw new AppError('Producto no encontrado', 400);
    }

    // Verificar que la bodega exista
    const bodega = await prisma.bodega.findUnique({
      where: { id: data.bodegaId },
    });

    if (!bodega) {
      throw new AppError('Bodega no encontrada', 400);
    }

    // Verificar stock para salidas
    if (data.tipo === 'salida') {
      if (producto.stockActual < data.cantidad) {
        throw new AppError('Stock insuficiente para esta salida', 400);
      }
    }

    // Crear movimiento
    const movimiento = await prisma.movimiento.create({
      data: {
        tipo: data.tipo,
        productoId: data.productoId,
        bodegaId: data.bodegaId,
        cantidad: data.cantidad,
        observaciones: data.observaciones,
        registradoPorId,
      },
      include: {
        producto: {
          include: {
            categoria: true,
            unidadMedida: true,
          },
        },
        bodega: true,
        registradoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    // Actualizar stock del producto
    const nuevoStock = data.tipo === 'entrada' 
      ? producto.stockActual + data.cantidad 
      : producto.stockActual - data.cantidad;

    await prisma.producto.update({
      where: { id: data.productoId },
      data: { stockActual: nuevoStock },
    });

    return {
      ...movimiento,
      stockAnterior: producto.stockActual,
      stockNuevo: nuevoStock,
    };
  },

  async delete(id: string) {
    const movimiento = await prisma.movimiento.findUnique({ where: { id } });

    if (!movimiento) {
      throw new AppError('Movimiento no encontrado', 404);
    }

    // Obtener producto para revertir stock
    const producto = await prisma.producto.findUnique({
      where: { id: movimiento.productoId },
    });

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    // Revertir stock
    const stockRevertido = movimiento.tipo === 'entrada'
      ? producto.stockActual - movimiento.cantidad
      : producto.stockActual + movimiento.cantidad;

    if (stockRevertido < 0) {
      throw new AppError('No se puede revertir este movimiento, dejaría stock negativo', 400);
    }

    await prisma.$transaction([
      // Eliminar movimiento
      prisma.movimiento.delete({ where: { id } }),
      // Actualizar stock
      prisma.producto.update({
        where: { id: movimiento.productoId },
        data: { stockActual: stockRevertido },
      }),
    ]);

    return { 
      message: 'Movimiento eliminado y stock revertido correctamente',
      stockRevertido 
    };
  },

  async getEstadisticas(fechaInicio?: Date, fechaFin?: Date) {
    const where: any = {};
    
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) {
        where.fecha.gte = fechaInicio;
      }
      if (fechaFin) {
        where.fecha.lte = fechaFin;
      }
    }

    const [totalEntradas, totalSalidas, movimientosPorProducto, movimientosPorBodega] = await Promise.all([
      // Total de entradas
      prisma.movimiento.aggregate({
        where: { ...where, tipo: 'entrada' },
        _sum: { cantidad: true },
        _count: true,
      }),
      // Total de salidas
      prisma.movimiento.aggregate({
        where: { ...where, tipo: 'salida' },
        _sum: { cantidad: true },
        _count: true,
      }),
      // Movimientos por producto
      prisma.movimiento.groupBy({
        by: ['productoId'],
        where,
        _sum: { cantidad: true },
        _count: true,
        orderBy: {
          _sum: { cantidad: 'desc' },
        },
      }),
      // Movimientos por bodega
      prisma.movimiento.groupBy({
        by: ['bodegaId'],
        where,
        _sum: { cantidad: true },
        _count: true,
        orderBy: {
          _sum: { cantidad: 'desc' },
        },
      }),
    ]);

    // Obtener detalles de productos y bodegas
    const productosIds = movimientosPorProducto.map(m => m.productoId);
    const bodegasIds = movimientosPorBodega.map(m => m.bodegaId);

    const [productos, bodegas] = await Promise.all([
      prisma.producto.findMany({
        where: { id: { in: productosIds } },
        include: { categoria: true, unidadMedida: true },
      }),
      prisma.bodega.findMany({
        where: { id: { in: bodegasIds } },
      }),
    ]);

    const movimientosPorProductoDetallados = movimientosPorProducto.map(mov => {
      const producto = productos.find(p => p.id === mov.productoId);
      return {
        producto,
        totalCantidad: mov._sum.cantidad || 0,
        totalMovimientos: mov._count,
      };
    });

    const movimientosPorBodegaDetallados = movimientosPorBodega.map(mov => {
      const bodega = bodegas.find(b => b.id === mov.bodegaId);
      return {
        bodega,
        totalCantidad: mov._sum.cantidad || 0,
        totalMovimientos: mov._count,
      };
    });

    return {
      resumen: {
        totalEntradas: totalEntradas._sum.cantidad || 0,
        totalSalidas: totalSalidas._sum.cantidad || 0,
        totalMovimientos: (totalEntradas._count || 0) + (totalSalidas._count || 0),
      },
      porProducto: movimientosPorProductoDetallados,
      porBodega: movimientosPorBodegaDetallados,
    };
  },
};
