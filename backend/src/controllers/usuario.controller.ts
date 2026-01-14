import { Request, Response, NextFunction } from 'express';
import { usuarioService } from '../services/usuario.service';

export const usuarioController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, activo } = req.query;
      
      const result = await usuarioService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        activo: activo ? activo === 'true' : undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.findById(id);

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await usuarioService.create(req.body);

      res.status(201).json({
        success: true,
        data: usuario,
        message: 'Usuario creado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.update(id, req.body);

      res.json({
        success: true,
        data: usuario,
        message: 'Usuario actualizado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await usuarioService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await usuarioService.toggleActive(id);

      res.json({
        success: true,
        data: result,
        message: result.activo ? 'Usuario activado' : 'Usuario desactivado',
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const result = await usuarioService.resetPassword(id, password);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
