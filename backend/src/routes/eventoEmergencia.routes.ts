import { Router } from 'express';
import { body, param } from 'express-validator';
import { eventoEmergenciaController } from '../controllers/eventoEmergencia.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /eventos - Listar todos los eventos de emergencia
router.get('/', authorize('emergencias:leer'), eventoEmergenciaController.findAll);

// GET /eventos/:id - Obtener evento de emergencia por ID
router.get(
  '/:id',
  authorize('emergencias:leer'),
  [param('id').isUUID()],
  validate,
  eventoEmergenciaController.findById
);

// POST /eventos - Crear evento de emergencia
router.post(
  '/',
  authorize('emergencias:crear'),
  [
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 200 }),
    body('tipoDesastreId').isUUID(),
    body('fechaInicio').isISO8601().toDate(),
    body('fechaFin').optional().isISO8601().toDate(),
    body('departamento').notEmpty().trim(),
    body('municipio').notEmpty().trim(),
    body('descripcion').optional().trim(),
  ],
  validate,
  eventoEmergenciaController.create
);

// PUT /eventos/:id - Actualizar evento de emergencia
router.put(
  '/:id',
  authorize('emergencias:actualizar'),
  [
    param('id').isUUID(),
    body('nombre').optional().trim().isLength({ min: 2, max: 200 }),
    body('tipoDesastreId').optional().isUUID(),
    body('fechaInicio').optional().isISO8601().toDate(),
    body('fechaFin').optional().isISO8601().toDate(),
    body('departamento').optional().trim(),
    body('municipio').optional().trim(),
    body('estado').optional().isIn(['activo', 'cerrado', 'suspendido']),
    body('descripcion').optional().trim(),
  ],
  validate,
  eventoEmergenciaController.update
);

// DELETE /eventos/:id - Eliminar evento de emergencia
router.delete(
  '/:id',
  authorize('emergencias:eliminar'),
  [param('id').isUUID()],
  validate,
  eventoEmergenciaController.delete
);

// PATCH /eventos/:id/cerrar - Cerrar evento de emergencia
router.patch(
  '/:id/cerrar',
  authorize('emergencias:actualizar'),
  [param('id').isUUID()],
  validate,
  eventoEmergenciaController.cerrarEvento
);

export default router;
