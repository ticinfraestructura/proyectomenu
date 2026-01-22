import { Request, Response, NextFunction } from 'express';
import { movimientoService } from '../services/movimiento.service';

export const movimientoController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        tipo,
        productoId,
        bodegaId,
        fechaInicio,
        fechaFin,
      } = req.query;

      const filters = {
        tipo: tipo as string,
        productoId: productoId as string,
        bodegaId: bodegaId as string,
        fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
      };

      const movimientos = await movimientoService.findAll(filters);

      res.json({
        success: true,
        data: movimientos,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const movimiento = await movimientoService.findById(id);

      res.json({
        success: true,
        data: movimiento,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Obtener usuarioId del token
      const registradoPorId = 'admin-user'; // Temporal
      
      const movimiento = await movimientoService.create(req.body, registradoPorId);

      res.status(201).json({
        success: true,
        data: movimiento,
        message: 'Movimiento creado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await movimientoService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEstadisticas(req: Request, res: Response, next: NextFunction) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      const estadisticas = await movimientoService.getEstadisticas(
        fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin ? new Date(fechaFin as string) : undefined
      );

      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error) {
      next(error);
    }
  },
};
