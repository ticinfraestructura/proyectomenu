import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AppError } from './errorHandler';
import { prisma } from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize = (...requiredPermissions: string[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      // Si el usuario tiene rol ADMIN, permitir todo
      if (req.user.roles.includes('ADMIN')) {
        return next();
      }

      // Obtener permisos del usuario desde la DB
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.userId },
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

      // Obtener todos los códigos de permisos del usuario
      const userPermissions = new Set<string>();
      usuario.roles.forEach((ur) => {
        ur.rol.permisos.forEach((rp) => {
          userPermissions.add(rp.permiso.codigo);
        });
      });

      // Verificar si tiene al menos uno de los permisos requeridos
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.has(perm)
      );

      if (!hasPermission) {
        throw new AppError('Access denied. Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkPermission = (modulo: string, accion: string) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.userId },
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

      const tienePermiso = usuario.roles.some((ur) =>
        ur.rol.permisos.some(
          (rp) => rp.permiso.modulo === modulo && rp.permiso.accion === accion
        )
      );

      if (!tienePermiso) {
        throw new AppError(
          `Access denied. Missing permission: ${modulo}:${accion}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
