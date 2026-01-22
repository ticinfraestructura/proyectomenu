import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { movimientoController } from '../controllers/movimiento.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /movimientos - Listar todos los movimientos
router.get(
  '/',
  authorize('inventario:leer'),
  [
    query('tipo').optional().isIn(['entrada', 'salida']),
    query('productoId').optional().isUUID(),
    query('bodegaId').optional().isUUID(),
    query('fechaInicio').optional().isISO8601().toDate(),
    query('fechaFin').optional().isISO8601().toDate(),
  ],
  validate,
  movimientoController.findAll
);

// GET /movimientos/:id - Obtener movimiento por ID
router.get(
  '/:id',
  authorize('inventario:leer'),
  [param('id').isUUID()],
  validate,
  movimientoController.findById
);

// POST /movimientos - Crear movimiento
router.post(
  '/',
  authorize('inventario:crear'),
  [
    body('tipo').isIn(['entrada', 'salida']),
    body('productoId').isUUID(),
    body('bodegaId').isUUID(),
    body('cantidad').isInt({ min: 1 }),
    body('observaciones').optional().trim(),
  ],
  validate,
  movimientoController.create
);

// DELETE /movimientos/:id - Eliminar movimiento
router.delete(
  '/:id',
  authorize('inventario:eliminar'),
  [param('id').isUUID()],
  validate,
  movimientoController.delete
);

// GET /movimientos/estadisticas - Obtener estadísticas de movimientos
router.get(
  '/estadisticas',
  authorize('inventario:leer'),
  movimientoController.getEstadisticas
);

export default router;
