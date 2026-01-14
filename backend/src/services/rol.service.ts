import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateRolDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  permisos: string[];
}

interface UpdateRolDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisos?: string[];
}

export const rolService = {
  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { activo: true };
    
    const roles = await prisma.rol.findMany({
      where,
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
        createdAt: true,
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
        _count: {
          select: { usuarios: true },
        },
      },
    });

    return roles.map((r) => ({
      ...r,
      permisos: r.permisos.map((rp) => rp.permiso),
      usuariosCount: r._count.usuarios,
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
        createdAt: true,
        updatedAt: true,
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

  async create(data: CreateRolDto) {
    const existing = await prisma.rol.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new AppError('Ya existe un rol con ese código', 400);
    }

    const rol = await prisma.rol.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        permisos: {
          create: data.permisos.map((permisoId) => ({
            permiso: { connect: { id: permisoId } },
          })),
        },
      },
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
      },
    });

    return {
      ...rol,
      permisos: rol.permisos.map((rp) => rp.permiso),
    };
  },

  async update(id: string, data: UpdateRolDto) {
    const rol = await prisma.rol.findUnique({ where: { id } });

    if (!rol) {
      throw new AppError('Rol no encontrado', 404);
    }

    if (data.codigo && data.codigo !== rol.codigo) {
      const existing = await prisma.rol.findUnique({
        where: { codigo: data.codigo },
      });
      if (existing) {
        throw new AppError('Ya existe un rol con ese código', 400);
      }
    }

    if (data.permisos) {
      await prisma.rolPermiso.deleteMany({ where: { rolId: id } });
      await prisma.rolPermiso.createMany({
        data: data.permisos.map((permisoId) => ({
          rolId: id,
          permisoId,
        })),
      });
    }

    const { permisos, ...updateData } = data;

    const updated = await prisma.rol.update({
      where: { id },
      data: updateData,
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
      },
    });

    return {
      ...updated,
      permisos: updated.permisos.map((rp) => rp.permiso),
    };
  },

  async delete(id: string) {
    const rol = await prisma.rol.findUnique({
      where: { id },
      include: { _count: { select: { usuarios: true } } },
    });

    if (!rol) {
      throw new AppError('Rol no encontrado', 404);
    }

    if (rol._count.usuarios > 0) {
      throw new AppError('No se puede eliminar un rol con usuarios asignados', 400);
    }

    await prisma.rol.delete({ where: { id } });

    return { message: 'Rol eliminado correctamente' };
  },

  async findAllPermisos() {
    const permisos = await prisma.permiso.findMany({
      orderBy: [{ modulo: 'asc' }, { accion: 'asc' }],
    });

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
