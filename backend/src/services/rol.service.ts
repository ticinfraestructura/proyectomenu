import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export const rolService = {
  async findAll() {
    const roles = await prisma.rol.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
        permisos: {
          include: {
            permiso: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                modulo: true,
                accion: true,
              },
            },
          },
        },
      },
    });

    return roles.map((r) => ({
      ...r,
      permisos: r.permisos.map((rp) => rp.permiso),
    }));
  },

  async findById(id: string) {
    const rol = await prisma.rol.findUnique({
      where: { id },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
        permisos: {
          include: {
            permiso: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                modulo: true,
                accion: true,
              },
            },
          },
        },
      },
    });

    if (!rol) {
      throw new AppError('Rol no encontrado', 404);
    }

    return {
      ...rol,
      permisos: rol.permisos.map((rp) => rp.permiso),
    };
  },

  async findAllPermisos() {
    const permisos = await prisma.permiso.findMany({
      orderBy: [{ modulo: 'asc' }, { accion: 'asc' }],
    });

    // Agrupar por módulo
    const grouped = permisos.reduce((acc: any, p) => {
      if (!acc[p.modulo]) {
        acc[p.modulo] = [];
      }
      acc[p.modulo].push(p);
      return acc;
    }, {});

    return { permisos, grouped };
  },
};
