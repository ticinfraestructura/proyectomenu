import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { zonaAfectadaController } from '../controllers/zonaAfectada.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /zonas - Listar todas las zonas afectadas (opcionalmente por evento)
router.get(
  '/',
  authorize('emergencias:leer'),
  [query('eventoId').optional().isUUID()],
  validate,
  zonaAfectadaController.findAll
);

// GET /zonas/:id - Obtener zona afectada por ID
router.get(
  '/:id',
  authorize('emergencias:leer'),
  [param('id').isUUID()],
  validate,
  zonaAfectadaController.findById
);

// POST /zonas - Crear zona afectada
router.post(
  '/',
  authorize('emergencias:crear'),
  [
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 200 }),
    body('eventoEmergenciaId').isUUID(),
    body('coordenadas').optional().trim(),
    body('nivelAfectacion').isIn(['alto', 'medio', 'bajo']),
    body('poblacionEstimada').optional().isInt({ min: 0 }),
    body('descripcion').optional().trim(),
  ],
  validate,
  zonaAfectadaController.create
);

// PUT /zonas/:id - Actualizar zona afectada
router.put(
  '/:id',
  authorize('emergencias:actualizar'),
  [
    param('id').isUUID(),
    body('nombre').optional().trim().isLength({ min: 2, max: 200 }),
    body('coordenadas').optional().trim(),
    body('nivelAfectacion').optional().isIn(['alto', 'medio', 'bajo']),
    body('poblacionEstimada').optional().isInt({ min: 0 }),
    body('descripcion').optional().trim(),
  ],
  validate,
  zonaAfectadaController.update
);

// DELETE /zonas/:id - Eliminar zona afectada
router.delete(
  '/:id',
  authorize('emergencias:eliminar'),
  [param('id').isUUID()],
  validate,
  zonaAfectadaController.delete
);

export default router;
