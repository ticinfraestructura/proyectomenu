import { Request, Response, NextFunction } from 'express';
import { eventoEmergenciaService } from '../services/eventoEmergencia.service';

export const eventoEmergenciaController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const eventos = await eventoEmergenciaService.findAll(includeInactive);

      res.json({
        success: true,
        data: eventos,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const evento = await eventoEmergenciaService.findById(id);

      res.json({
        success: true,
        data: evento,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const evento = await eventoEmergenciaService.create(req.body);

      res.status(201).json({
        success: true,
        data: evento,
        message: 'Evento de emergencia creado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const evento = await eventoEmergenciaService.update(id, req.body);

      res.json({
        success: true,
        data: evento,
        message: 'Evento de emergencia actualizado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await eventoEmergenciaService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async cerrarEvento(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await eventoEmergenciaService.cerrarEvento(id);

      res.json({
        success: true,
        data: result.evento,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
