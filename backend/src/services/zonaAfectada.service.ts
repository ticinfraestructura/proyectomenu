import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateZonaDto {
  nombre: string;
  eventoEmergenciaId: string;
  coordenadas?: string;
  nivelAfectacion: string;
  poblacionEstimada?: number;
  descripcion?: string;
}

interface UpdateZonaDto {
  nombre?: string;
  coordenadas?: string;
  nivelAfectacion?: string;
  poblacionEstimada?: number;
  descripcion?: string;
}

export const zonaAfectadaService = {
  async findAll(eventoId?: string) {
    const where = eventoId ? { eventoEmergenciaId: eventoId } : {};
    
    const zonas = await prisma.zonaAfectada.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        eventoEmergencia: {
          select: {
            id: true,
            nombre: true,
            estado: true,
          },
        },
        familias: true,
        _count: {
          select: { 
            familias: true,
          },
        },
      },
    });

    return zonas.map((z: any) => ({
      ...z,
      familiasCount: z._count.familias,
      personasCount: z.familias.length,
    }));
  },

  async findById(id: string) {
    const zona = await prisma.zonaAfectada.findUnique({
      where: { id },
      include: {
        eventoEmergencia: true,
        familias: true,
        _count: {
          select: { 
            familias: true,
          },
        },
      },
    });

    if (!zona) {
      throw new AppError('Zona afectada no encontrada', 404);
    }

    return {
      ...zona,
      familiasCount: zona._count.familias,
      personasCount: zona.familias.reduce((total: number, f: any) => total + f._count.miembros, 0),
    };
  },

  async create(data: CreateZonaDto) {
    const evento = await prisma.eventoEmergencia.findUnique({
      where: { id: data.eventoEmergenciaId },
    });

    if (!evento) {
      throw new AppError('Evento de emergencia no encontrado', 400);
    }

    if (evento.estado === 'cerrado') {
      throw new AppError('No se pueden agregar zonas a un evento cerrado', 400);
    }

    const zona = await prisma.zonaAfectada.create({
      data: {
        nombre: data.nombre,
        eventoEmergenciaId: data.eventoEmergenciaId,
        coordenadas: data.coordenadas,
        nivelAfectacion: data.nivelAfectacion,
        poblacionEstimada: data.poblacionEstimada,
        descripcion: data.descripcion,
      },
      include: {
        eventoEmergencia: true,
      },
    });

    return zona;
  },

  async update(id: string, data: UpdateZonaDto) {
    const zona = await prisma.zonaAfectada.findUnique({ 
      where: { id },
      include: { eventoEmergencia: true },
    });

    if (!zona) {
      throw new AppError('Zona afectada no encontrada', 404);
    }

    if (zona.eventoEmergencia.estado === 'cerrado') {
      throw new AppError('No se puede modificar una zona de un evento cerrado', 400);
    }

    const updated = await prisma.zonaAfectada.update({
      where: { id },
      data,
      include: {
        eventoEmergencia: true,
      },
    });

    return updated;
  },

  async delete(id: string) {
    const zona = await prisma.zonaAfectada.findUnique({
      where: { id },
      include: { 
        _count: { select: { familias: true } },
      },
    });

    if (!zona) {
      throw new AppError('Zona afectada no encontrada', 404);
    }

    if (zona._count.familias > 0) {
      throw new AppError('No se puede eliminar una zona con familias asociadas', 400);
    }

    await prisma.zonaAfectada.delete({ where: { id } });

    return { message: 'Zona afectada eliminada correctamente' };
  },
};
