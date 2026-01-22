import { Router } from 'express';
import { body, param } from 'express-validator';
import { unidadController } from '../controllers/unidad.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /unidades - Listar todas las unidades de medida
router.get('/', authorize('configuracion:leer'), unidadController.findAll);

// GET /unidades/:id - Obtener unidad de medida por ID
router.get(
  '/:id',
  authorize('configuracion:leer'),
  [param('id').isUUID()],
  validate,
  unidadController.findById
);

// POST /unidades - Crear unidad de medida
router.post(
  '/',
  authorize('configuracion:crear'),
  [
    body('codigo').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('abreviatura').notEmpty().trim().isLength({ min: 1, max: 10 }),
  ],
  validate,
  unidadController.create
);

// PUT /unidades/:id - Actualizar unidad de medida
router.put(
  '/:id',
  authorize('configuracion:actualizar'),
  [
    param('id').isUUID(),
    body('codigo').optional().trim().isLength({ min: 2, max: 50 }),
    body('nombre').optional().trim().isLength({ min: 2, max: 100 }),
    body('abreviatura').optional().trim().isLength({ min: 1, max: 10 }),
    body('activo').optional().isBoolean(),
  ],
  validate,
  unidadController.update
);

// DELETE /unidades/:id - Eliminar unidad de medida
router.delete(
  '/:id',
  authorize('configuracion:eliminar'),
  [param('id').isUUID()],
  validate,
  unidadController.delete
);

// PATCH /unidades/:id/toggle-active - Activar/Desactivar unidad de medida
router.patch(
  '/:id/toggle-active',
  authorize('configuracion:actualizar'),
  [param('id').isUUID()],
  validate,
  unidadController.toggleActive
);

export default router;
