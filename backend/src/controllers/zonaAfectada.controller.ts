import { Request, Response, NextFunction } from 'express';
import { zonaAfectadaService } from '../services/zonaAfectada.service';

export const zonaAfectadaController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const eventoId = req.query.eventoId as string;
      const zonas = await zonaAfectadaService.findAll(eventoId);

      res.json({
        success: true,
        data: zonas,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const zona = await zonaAfectadaService.findById(id);

      res.json({
        success: true,
        data: zona,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const zona = await zonaAfectadaService.create(req.body);

      res.status(201).json({
        success: true,
        data: zona,
        message: 'Zona afectada creada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const zona = await zonaAfectadaService.update(id, req.body);

      res.json({
        success: true,
        data: zona,
        message: 'Zona afectada actualizada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await zonaAfectadaService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
