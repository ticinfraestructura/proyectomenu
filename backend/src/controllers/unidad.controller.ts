import { Request, Response, NextFunction } from 'express';
import { unidadService } from '../services/unidad.service';

export const unidadController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const unidades = await unidadService.findAll(includeInactive);

      res.json({
        success: true,
        data: unidades,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unidad = await unidadService.findById(id);

      res.json({
        success: true,
        data: unidad,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const unidad = await unidadService.create(req.body);

      res.status(201).json({
        success: true,
        data: unidad,
        message: 'Unidad de medida creada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unidad = await unidadService.update(id, req.body);

      res.json({
        success: true,
        data: unidad,
        message: 'Unidad de medida actualizada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await unidadService.delete(id);

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
      const result = await unidadService.toggleActive(id);

      res.json({
        success: true,
        data: result.unidad,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
