import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateCategoriaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface UpdateCategoriaDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export const categoriaService = {
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { activo: true };
    
    const categorias = await prisma.categoriaProducto.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    return categorias.map((c: any) => ({
      ...c,
      productosCount: c._count.productos,
    }));
  },

  async findById(id: string) {
    const categoria = await prisma.categoriaProducto.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    return {
      ...categoria,
      productosCount: categoria._count.productos,
    };
  },

  async create(data: CreateCategoriaDto) {
    const existing = await prisma.categoriaProducto.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new AppError('Ya existe una categoría con ese código', 400);
    }

    const categoria = await prisma.categoriaProducto.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
    });

    return categoria;
  },

  async update(id: string, data: UpdateCategoriaDto) {
    const categoria = await prisma.categoriaProducto.findUnique({ where: { id } });

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (data.codigo && data.codigo !== categoria.codigo) {
      const existing = await prisma.categoriaProducto.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new AppError('Ya existe una categoría con ese código', 400);
      }
    }

    const updated = await prisma.categoriaProducto.update({
      where: { id },
      data,
    });

    return updated;
  },

  async delete(id: string) {
    const categoria = await prisma.categoriaProducto.findUnique({
      where: { id },
      include: { _count: { select: { productos: true } } },
    });

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    if (categoria._count.productos > 0) {
      throw new AppError('No se puede eliminar una categoría con productos asociados', 400);
    }

    await prisma.categoriaProducto.delete({ where: { id } });

    return { message: 'Categoría eliminada correctamente' };
  },

  async toggleActive(id: string) {
    const categoria = await prisma.categoriaProducto.findUnique({ where: { id } });

    if (!categoria) {
      throw new AppError('Categoría no encontrada', 404);
    }

    const updated = await prisma.categoriaProducto.update({
      where: { id },
      data: { activo: !categoria.activo },
    });

    return {
      message: `Categoría ${updated.activo ? 'activada' : 'desactivada'} correctamente`,
      categoria: updated,
    };
  },
};
