import { Request, Response, NextFunction } from 'express';
import { categoriaService } from '../services/categoria.service';

export const categoriaController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categorias = await categoriaService.findAll(includeInactive);

      res.json({
        success: true,
        data: categorias,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.findById(id);

      res.json({
        success: true,
        data: categoria,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const categoria = await categoriaService.create(req.body);

      res.status(201).json({
        success: true,
        data: categoria,
        message: 'Categoría creada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.update(id, req.body);

      res.json({
        success: true,
        data: categoria,
        message: 'Categoría actualizada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await categoriaService.delete(id);

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
      const result = await categoriaService.toggleActive(id);

      res.json({
        success: true,
        data: result.categoria,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
