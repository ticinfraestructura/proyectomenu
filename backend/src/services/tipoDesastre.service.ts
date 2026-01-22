import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateTipoDesastreDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface UpdateTipoDesastreDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export const tipoDesastreService = {
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { activo: true };
    
    const tipos = await prisma.tipoDesastre.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { eventos: true },
        },
      },
    });

    return tipos.map((t: any) => ({
      ...t,
      eventosCount: t._count.eventos,
    }));
  },

  async findById(id: string) {
    const tipo = await prisma.tipoDesastre.findUnique({
      where: { id },
      include: {
        _count: {
          select: { eventos: true },
        },
      },
    });

    if (!tipo) {
      throw new AppError('Tipo de desastre no encontrado', 404);
    }

    return {
      ...tipo,
      eventosCount: tipo._count.eventos,
    };
  },

  async create(data: CreateTipoDesastreDto) {
    const existing = await prisma.tipoDesastre.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new AppError('Ya existe un tipo de desastre con ese código', 400);
    }

    const tipo = await prisma.tipoDesastre.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
      },
    });

    return tipo;
  },

  async update(id: string, data: UpdateTipoDesastreDto) {
    const tipo = await prisma.tipoDesastre.findUnique({ where: { id } });

    if (!tipo) {
      throw new AppError('Tipo de desastre no encontrado', 404);
    }

    if (data.codigo && data.codigo !== tipo.codigo) {
      const existing = await prisma.tipoDesastre.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new AppError('Ya existe un tipo de desastre con ese código', 400);
      }
    }

    const updated = await prisma.tipoDesastre.update({
      where: { id },
      data,
    });

    return updated;
  },

  async delete(id: string) {
    const tipo = await prisma.tipoDesastre.findUnique({
      where: { id },
      include: { _count: { select: { eventos: true } } },
    });

    if (!tipo) {
      throw new AppError('Tipo de desastre no encontrado', 404);
    }

    if (tipo._count.eventos > 0) {
      throw new AppError('No se puede eliminar un tipo de desastre con eventos asociados', 400);
    }

    await prisma.tipoDesastre.delete({ where: { id } });

    return { message: 'Tipo de desastre eliminado correctamente' };
  },

  async toggleActive(id: string) {
    const tipo = await prisma.tipoDesastre.findUnique({ where: { id } });

    if (!tipo) {
      throw new AppError('Tipo de desastre no encontrado', 404);
    }

    const updated = await prisma.tipoDesastre.update({
      where: { id },
      data: { activo: !tipo.activo },
    });

    return {
      message: `Tipo de desastre ${updated.activo ? 'activado' : 'desactivado'} correctamente`,
      tipo: updated,
    };
  },
};
