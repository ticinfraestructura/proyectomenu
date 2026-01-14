import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/errorHandler';

interface CreateUsuarioDto {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  password: string;
  roles: string[];
}

interface UpdateUsuarioDto {
  nombres?: string;
  apellidos?: string;
  email?: string;
  celular?: string;
  activo?: boolean;
  roles?: string[];
}

interface ListUsuariosParams {
  page?: number;
  limit?: number;
  search?: string;
  activo?: boolean;
}

export const usuarioService = {
  async findAll(params: ListUsuariosParams) {
    const { page = 1, limit = 10, search, activo } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { nombres: { contains: search } },
        { apellidos: { contains: search } },
        { email: { contains: search } },
      ];
    }
    
    if (activo !== undefined) {
      where.activo = activo;
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          email: true,
          celular: true,
          activo: true,
          fechaRegistro: true,
          ultimoAcceso: true,
          roles: {
            include: {
              rol: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                },
              },
            },
          },
        },
      }),
      prisma.usuario.count({ where }),
    ]);

    const usuariosFormateados = usuarios.map((u) => ({
      ...u,
      roles: u.roles.map((ur) => ur.rol),
    }));

    return {
      data: usuariosFormateados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        celular: true,
        activo: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            rol: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      ...usuario,
      roles: usuario.roles.map((ur) => ur.rol),
    };
  },

  async create(data: CreateUsuarioDto) {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    const passwordHash = await hashPassword(data.password);

    const usuario = await prisma.usuario.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        celular: data.celular,
        passwordHash,
        roles: {
          create: data.roles.map((rolId) => ({
            rol: { connect: { id: rolId } },
          })),
        },
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        celular: true,
        activo: true,
        fechaRegistro: true,
        roles: {
          include: {
            rol: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    return {
      ...usuario,
      roles: usuario.roles.map((ur) => ur.rol),
    };
  },

  async update(id: string, data: UpdateUsuarioDto) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (data.email && data.email !== usuario.email) {
      const existingUser = await prisma.usuario.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new AppError('El email ya está registrado', 400);
      }
    }

    // Si hay roles, actualizar la relación
    if (data.roles) {
      await prisma.usuarioRol.deleteMany({ where: { usuarioId: id } });
      await prisma.usuarioRol.createMany({
        data: data.roles.map((rolId) => ({
          usuarioId: id,
          rolId,
        })),
      });
    }

    const { roles, ...updateData } = data;

    const updated = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        celular: true,
        activo: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        roles: {
          include: {
            rol: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
              },
            },
          },
        },
      },
    });

    return {
      ...updated,
      roles: updated.roles.map((ur) => ur.rol),
    };
  },

  async delete(id: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await prisma.usuario.delete({ where: { id } });

    return { message: 'Usuario eliminado correctamente' };
  },

  async toggleActive(id: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data: { activo: !usuario.activo },
      select: {
        id: true,
        activo: true,
      },
    });

    return updated;
  },

  async resetPassword(id: string, newPassword: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.usuario.update({
      where: { id },
      data: { passwordHash },
    });

    return { message: 'Contraseña actualizada correctamente' };
  },
};
