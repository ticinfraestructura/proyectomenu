import { Request, Response, NextFunction } from 'express';
import { bodegaService } from '../services/bodega.service';

export const bodegaController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const bodegas = await bodegaService.findAll(includeInactive);

      res.json({
        success: true,
        data: bodegas,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bodega = await bodegaService.findById(id);

      res.json({
        success: true,
        data: bodega,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bodega = await bodegaService.create(req.body);

      res.status(201).json({
        success: true,
        data: bodega,
        message: 'Bodega creada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bodega = await bodegaService.update(id, req.body);

      res.json({
        success: true,
        data: bodega,
        message: 'Bodega actualizada correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await bodegaService.delete(id);

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
      const result = await bodegaService.toggleActive(id);

      res.json({
        success: true,
        data: result.bodega,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStockPorBodega(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await bodegaService.getStockPorBodega(id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
