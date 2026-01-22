import { Request, Response, NextFunction } from 'express';
import { tipoDesastreService } from '../services/tipoDesastre.service';

export const tipoDesastreController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const tipos = await tipoDesastreService.findAll(includeInactive);

      res.json({
        success: true,
        data: tipos,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tipo = await tipoDesastreService.findById(id);

      res.json({
        success: true,
        data: tipo,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tipo = await tipoDesastreService.create(req.body);

      res.status(201).json({
        success: true,
        data: tipo,
        message: 'Tipo de desastre creado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tipo = await tipoDesastreService.update(id, req.body);

      res.json({
        success: true,
        data: tipo,
        message: 'Tipo de desastre actualizado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await tipoDesastreService.delete(id);

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
      const result = await tipoDesastreService.toggleActive(id);

      res.json({
        success: true,
        data: result.tipo,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
