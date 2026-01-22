import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateUnidadDto {
  codigo: string;
  nombre: string;
  abreviatura: string;
}

interface UpdateUnidadDto {
  codigo?: string;
  nombre?: string;
  abreviatura?: string;
  activo?: boolean;
}

export const unidadService = {
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { activo: true };
    
    const unidades = await prisma.unidadMedida.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    return unidades.map((u: any) => ({
      ...u,
      productosCount: u._count.productos,
    }));
  },

  async findById(id: string) {
    const unidad = await prisma.unidadMedida.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    if (!unidad) {
      throw new AppError('Unidad de medida no encontrada', 404);
    }

    return {
      ...unidad,
      productosCount: unidad._count.productos,
    };
  },

  async create(data: CreateUnidadDto) {
    const existing = await prisma.unidadMedida.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new AppError('Ya existe una unidad de medida con ese código', 400);
    }

    const unidad = await prisma.unidadMedida.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        abreviatura: data.abreviatura,
      },
    });

    return unidad;
  },

  async update(id: string, data: UpdateUnidadDto) {
    const unidad = await prisma.unidadMedida.findUnique({ where: { id } });

    if (!unidad) {
      throw new AppError('Unidad de medida no encontrada', 404);
    }

    if (data.codigo && data.codigo !== unidad.codigo) {
      const existing = await prisma.unidadMedida.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new AppError('Ya existe una unidad de medida con ese código', 400);
      }
    }

    const updated = await prisma.unidadMedida.update({
      where: { id },
      data,
    });

    return updated;
  },

  async delete(id: string) {
    const unidad = await prisma.unidadMedida.findUnique({
      where: { id },
      include: { _count: { select: { productos: true } } },
    });

    if (!unidad) {
      throw new AppError('Unidad de medida no encontrada', 404);
    }

    if (unidad._count.productos > 0) {
      throw new AppError('No se puede eliminar una unidad de medida con productos asociados', 400);
    }

    await prisma.unidadMedida.delete({ where: { id } });

    return { message: 'Unidad de medida eliminada correctamente' };
  },

  async toggleActive(id: string) {
    const unidad = await prisma.unidadMedida.findUnique({ where: { id } });

    if (!unidad) {
      throw new AppError('Unidad de medida no encontrada', 404);
    }

    const updated = await prisma.unidadMedida.update({
      where: { id },
      data: { activo: !unidad.activo },
    });

    return {
      message: `Unidad de medida ${updated.activo ? 'activada' : 'desactivada'} correctamente`,
      unidad: updated,
    };
  },
};
