import { Router } from 'express';
import { body, param } from 'express-validator';
import { tipoDesastreController } from '../controllers/tipoDesastre.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /tipos-desastre - Listar todos los tipos de desastre
router.get('/', authorize('emergencias:leer'), tipoDesastreController.findAll);

// GET /tipos-desastre/:id - Obtener tipo de desastre por ID
router.get(
  '/:id',
  authorize('emergencias:leer'),
  [param('id').isUUID()],
  validate,
  tipoDesastreController.findById
);

// POST /tipos-desastre - Crear tipo de desastre
router.post(
  '/',
  authorize('emergencias:crear'),
  [
    body('codigo').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('descripcion').optional().trim(),
  ],
  validate,
  tipoDesastreController.create
);

// PUT /tipos-desastre/:id - Actualizar tipo de desastre
router.put(
  '/:id',
  authorize('emergencias:actualizar'),
  [
    param('id').isUUID(),
    body('codigo').optional().trim().isLength({ min: 2, max: 50 }),
    body('nombre').optional().trim().isLength({ min: 2, max: 100 }),
    body('descripcion').optional().trim(),
    body('activo').optional().isBoolean(),
  ],
  validate,
  tipoDesastreController.update
);

// DELETE /tipos-desastre/:id - Eliminar tipo de desastre
router.delete(
  '/:id',
  authorize('emergencias:eliminar'),
  [param('id').isUUID()],
  validate,
  tipoDesastreController.delete
);

// PATCH /tipos-desastre/:id/toggle-active - Activar/Desactivar tipo de desastre
router.patch(
  '/:id/toggle-active',
  authorize('emergencias:actualizar'),
  [param('id').isUUID()],
  validate,
  tipoDesastreController.toggleActive
);

export default router;
