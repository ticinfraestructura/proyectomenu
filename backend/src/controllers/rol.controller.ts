import { Request, Response, NextFunction } from 'express';
import { rolService } from '../services/rol.service';

export const rolController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const roles = await rolService.findAll(includeInactive);

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

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const rol = await rolService.create(req.body);

      res.status(201).json({
        success: true,
        data: rol,
        message: 'Rol creado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const rol = await rolService.update(id, req.body);

      res.json({
        success: true,
        data: rol,
        message: 'Rol actualizado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await rolService.delete(id);

      res.json({
        success: true,
        message: result.message,
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
