import { Request, Response, NextFunction } from 'express';
import { rolService } from '../services/rol.service';

export const rolController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await rolService.findAll();

      res.json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rol = await rolService.findById(id);

      res.json({
        success: true,
        data: rol,
      });
    } catch (error) {
      next(error);
    }
  },

  async findAllPermisos(req: Request, res: Response, next: NextFunction) {
    try {
      const permisos = await rolService.findAllPermisos();

      res.json({
        success: true,
        data: permisos,
      });
    } catch (error) {
      next(error);
    }
  },
};
