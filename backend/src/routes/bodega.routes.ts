import { Router } from 'express';
import { body, param } from 'express-validator';
import { bodegaController } from '../controllers/bodega.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /bodegas - Listar todas las bodegas
router.get(
  '/',
  authorize('inventario:leer'),
  [param('includeInactive').optional().isBoolean()],
  validate,
  bodegaController.findAll
);

// GET /bodegas/:id - Obtener bodega por ID
router.get(
  '/:id',
  authorize('inventario:leer'),
  [param('id').isUUID()],
  validate,
  bodegaController.findById
);

// GET /bodegas/:id/stock - Obtener stock por bodega
router.get(
  '/:id/stock',
  authorize('inventario:leer'),
  [param('id').isUUID()],
  validate,
  bodegaController.getStockPorBodega
);

// POST /bodegas - Crear bodega
router.post(
  '/',
  authorize('inventario:crear'),
  [
    body('codigo').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 200 }),
    body('direccion').notEmpty().trim(),
    body('capacidad').optional().isInt({ min: 1 }),
    body('responsableNombre').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('responsableEmail').isEmail().normalizeEmail(),
    body('responsableCelular').notEmpty().trim().isLength({ min: 7, max: 20 }),
  ],
  validate,
  bodegaController.create
);

// PUT /bodegas/:id - Actualizar bodega
router.put(
  '/:id',
  authorize('inventario:actualizar'),
  [
    param('id').isUUID(),
    body('codigo').optional().trim().isLength({ min: 2, max: 50 }),
    body('nombre').optional().trim().isLength({ min: 2, max: 200 }),
    body('direccion').optional().trim(),
    body('capacidad').optional().isInt({ min: 1 }),
    body('responsableNombre').optional().trim().isLength({ min: 2, max: 100 }),
    body('responsableEmail').optional().isEmail().normalizeEmail(),
    body('responsableCelular').optional().trim().isLength({ min: 7, max: 20 }),
    body('activo').optional().isBoolean(),
  ],
  validate,
  bodegaController.update
);

// DELETE /bodegas/:id - Eliminar bodega
router.delete(
  '/:id',
  authorize('inventario:eliminar'),
  [param('id').isUUID()],
  validate,
  bodegaController.delete
);

// PATCH /bodegas/:id/toggle-active - Activar/Desactivar bodega
router.patch(
  '/:id/toggle-active',
  authorize('inventario:actualizar'),
  [param('id').isUUID()],
  validate,
  bodegaController.toggleActive
);

export default router;
