import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getRefreshTokenExpiry,
  JwtPayload,
} from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    roles: string[];
  };
}

interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  password: string;
  rolCodigo?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!usuario.activo) {
      throw new AppError('User account is disabled', 401);
    }

    const isValidPassword = await comparePassword(password, usuario.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const roles = usuario.roles.map((ur) => ur.rol.codigo);

    const payload: JwtPayload = {
      userId: usuario.id,
      email: usuario.email,
      roles,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuarioId: usuario.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        roles,
      },
    };
  },

  async register(data: RegisterData): Promise<{ id: string; email: string }> {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const passwordHash = await hashPassword(data.password);

    const usuario = await prisma.usuario.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        celular: data.celular,
        passwordHash,
      },
    });

    if (data.rolCodigo) {
      const rol = await prisma.rol.findUnique({
        where: { codigo: data.rolCodigo },
      });

      if (rol) {
        await prisma.usuarioRol.create({
          data: {
            usuarioId: usuario.id,
            rolId: rol.id,
          },
        });
      }
    }

    return {
      id: usuario.id,
      email: usuario.email,
    };
  },

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        usuario: {
          include: {
            roles: {
              include: {
                rol: true,
              },
            },
          },
        },
      },
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expired', 401);
    }

    const roles = storedToken.usuario.roles.map((ur) => ur.rol.codigo);

    const payload: JwtPayload = {
      userId: storedToken.usuario.id,
      email: storedToken.usuario.email,
      roles,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        usuarioId: storedToken.usuario.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new AppError('User not found', 404);
    }

    const isValidPassword = await comparePassword(currentPassword, usuario.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 400);
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.refreshToken.deleteMany({
      where: { usuarioId: userId },
    });
  },

  async getProfile(userId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!usuario) {
      throw new AppError('User not found', 404);
    }

    const roles = usuario.roles.map((ur) => ur.rol.codigo);
    const permisos = usuario.roles.flatMap((ur) =>
      ur.rol.permisos.map((rp) => `${rp.permiso.modulo}:${rp.permiso.accion}`)
    );

    return {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      celular: usuario.celular,
      roles,
      permisos: [...new Set(permisos)],
    };
  },
};
