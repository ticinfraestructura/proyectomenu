import { Request, Response, NextFunction } from 'express';
import { productoService } from '../services/producto.service';

export const productoController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categoriaId = req.query.categoriaId as string;
      const search = req.query.search as string;
      
      const productos = await productoService.findAll(includeInactive, categoriaId, search);

      res.json({
        success: true,
        data: productos,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const producto = await productoService.findById(id);

      res.json({
        success: true,
        data: producto,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await productoService.create(req.body);

      res.status(201).json({
        success: true,
        data: producto,
        message: 'Producto creado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const producto = await productoService.update(id, req.body);

      res.json({
        success: true,
        data: producto,
        message: 'Producto actualizado correctamente',
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productoService.delete(id);

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
      const result = await productoService.toggleActive(id);

      res.json({
        success: true,
        data: result.producto,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },

  async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { cantidad, tipo, bodegaId, observaciones } = req.body;

      const result = await productoService.adjustStock(id, cantidad, tipo, bodegaId, observaciones);

      res.json({
        success: true,
        data: result.movimiento,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
};
