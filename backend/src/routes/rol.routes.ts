import { Router } from 'express';
import { body, param } from 'express-validator';
import { rolController } from '../controllers/rol.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /roles - Listar todos los roles
router.get('/', authorize('roles:leer'), rolController.findAll);

// GET /roles/permisos - Listar todos los permisos
router.get('/permisos', authorize('roles:leer'), rolController.findAllPermisos);

// GET /roles/:id - Obtener rol por ID
router.get(
  '/:id',
  authorize('roles:leer'),
  [param('id').isUUID()],
  validate,
  rolController.findById
);

// POST /roles - Crear rol
router.post(
  '/',
  authorize('roles:crear'),
  [
    body('codigo').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('descripcion').optional().trim(),
    body('permisos').isArray(),
    body('permisos.*').isUUID(),
  ],
  validate,
  rolController.create
);

// PUT /roles/:id - Actualizar rol
router.put(
  '/:id',
  authorize('roles:actualizar'),
  [
    param('id').isUUID(),
    body('codigo').optional().trim().isLength({ min: 2, max: 50 }),
    body('nombre').optional().trim().isLength({ min: 2, max: 100 }),
    body('descripcion').optional().trim(),
    body('activo').optional().isBoolean(),
    body('permisos').optional().isArray(),
    body('permisos.*').optional().isUUID(),
  ],
  validate,
  rolController.update
);

// DELETE /roles/:id - Eliminar rol
router.delete(
  '/:id',
  authorize('roles:eliminar'),
  [param('id').isUUID()],
  validate,
  rolController.delete
);

export default router;
