import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateEventoDto {
  nombre: string;
  tipoDesastreId: string;
  fechaInicio: Date;
  fechaFin?: Date;
  departamento: string;
  municipio: string;
  descripcion?: string;
}

interface UpdateEventoDto {
  nombre?: string;
  tipoDesastreId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  departamento?: string;
  municipio?: string;
  estado?: string;
  descripcion?: string;
}

export const eventoEmergenciaService = {
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { estado: 'activo' };
    
    const eventos = await prisma.eventoEmergencia.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tipoDesastre: true,
        zonasAfectadas: true,
        _count: {
          select: { 
            zonasAfectadas: true,
            entregas: true,
            actas: true,
          },
        },
      },
    });

    return eventos.map((e: any) => ({
      ...e,
      zonasCount: e._count.zonasAfectadas,
      entregasCount: e._count.entregas,
      actasCount: e._count.actas,
    }));
  },

  async findById(id: string) {
    const evento = await prisma.eventoEmergencia.findUnique({
      where: { id },
      include: {
        tipoDesastre: true,
        zonasAfectadas: {
          include: {
            familias: true,
            _count: {
              select: { familias: true },
            },
          },
        },
        _count: {
          select: { 
            zonasAfectadas: true,
            entregas: true,
            actas: true,
          },
        },
      },
    });

    if (!evento) {
      throw new AppError('Evento de emergencia no encontrado', 404);
    }

    return {
      ...evento,
      zonasCount: evento._count.zonasAfectadas,
      entregasCount: evento._count.entregas,
      actasCount: evento._count.actas,
    };
  },

  async create(data: CreateEventoDto) {
    const tipoDesastre = await prisma.tipoDesastre.findUnique({
      where: { id: data.tipoDesastreId },
    });

    if (!tipoDesastre) {
      throw new AppError('Tipo de desastre no encontrado', 400);
    }

    if (data.fechaFin && data.fechaFin < data.fechaInicio) {
      throw new AppError('La fecha de fin no puede ser anterior a la fecha de inicio', 400);
    }

    const evento = await prisma.eventoEmergencia.create({
      data: {
        nombre: data.nombre,
        tipoDesastreId: data.tipoDesastreId,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        departamento: data.departamento,
        municipio: data.municipio,
        descripcion: data.descripcion,
      },
      include: {
        tipoDesastre: true,
      },
    });

    return evento;
  },

  async update(id: string, data: UpdateEventoDto) {
    const evento = await prisma.eventoEmergencia.findUnique({ where: { id } });

    if (!evento) {
      throw new AppError('Evento de emergencia no encontrado', 404);
    }

    if (data.tipoDesastreId) {
      const tipoDesastre = await prisma.tipoDesastre.findUnique({
        where: { id: data.tipoDesastreId },
      });
      if (!tipoDesastre) {
        throw new AppError('Tipo de desastre no encontrado', 400);
      }
    }

    if (data.fechaInicio && data.fechaFin && data.fechaFin < data.fechaInicio) {
      throw new AppError('La fecha de fin no puede ser anterior a la fecha de inicio', 400);
    }

    const updated = await prisma.eventoEmergencia.update({
      where: { id },
      data,
      include: {
        tipoDesastre: true,
      },
    });

    return updated;
  },

  async delete(id: string) {
    const evento = await prisma.eventoEmergencia.findUnique({
      where: { id },
      include: { 
        _count: { 
          select: { 
            zonasAfectadas: true,
            entregas: true,
            actas: true,
          },
        },
      },
    });

    if (!evento) {
      throw new AppError('Evento de emergencia no encontrado', 404);
    }

    if (evento._count.zonasAfectadas > 0 || evento._count.entregas > 0 || evento._count.actas > 0) {
      throw new AppError('No se puede eliminar un evento con zonas, entregas o actas asociadas', 400);
    }

    await prisma.eventoEmergencia.delete({ where: { id } });

    return { message: 'Evento de emergencia eliminado correctamente' };
  },

  async cerrarEvento(id: string) {
    const evento = await prisma.eventoEmergencia.findUnique({ where: { id } });

    if (!evento) {
      throw new AppError('Evento de emergencia no encontrado', 404);
    }

    if (evento.estado === 'cerrado') {
      throw new AppError('El evento ya está cerrado', 400);
    }

    const updated = await prisma.eventoEmergencia.update({
      where: { id },
      data: { 
        estado: 'cerrado',
        fechaFin: new Date(),
      },
    });

    return {
      message: 'Evento cerrado correctamente',
      evento: updated,
    };
  },
};
