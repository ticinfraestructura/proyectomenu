import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /usuarios - Listar usuarios (con paginación y filtros)
router.get(
  '/',
  authorize('usuarios:leer'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('activo').optional().isBoolean(),
  ],
  validate,
  usuarioController.findAll
);

// GET /usuarios/:id - Obtener usuario por ID
router.get(
  '/:id',
  authorize('usuarios:leer'),
  [param('id').isUUID()],
  validate,
  usuarioController.findById
);

// POST /usuarios - Crear usuario
router.post(
  '/',
  authorize('usuarios:crear'),
  [
    body('nombres').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('apellidos').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('celular').notEmpty().trim().isLength({ min: 7, max: 20 }),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('roles').isArray({ min: 1 }),
    body('roles.*').isUUID(),
  ],
  validate,
  usuarioController.create
);

// PUT /usuarios/:id - Actualizar usuario
router.put(
  '/:id',
  authorize('usuarios:actualizar'),
  [
    param('id').isUUID(),
    body('nombres').optional().trim().isLength({ min: 2, max: 100 }),
    body('apellidos').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('celular').optional().trim().isLength({ min: 7, max: 20 }),
    body('activo').optional().isBoolean(),
    body('roles').optional().isArray({ min: 1 }),
    body('roles.*').optional().isUUID(),
  ],
  validate,
  usuarioController.update
);

// DELETE /usuarios/:id - Eliminar usuario
router.delete(
  '/:id',
  authorize('usuarios:eliminar'),
  [param('id').isUUID()],
  validate,
  usuarioController.delete
);

// PATCH /usuarios/:id/toggle-active - Activar/Desactivar usuario
router.patch(
  '/:id/toggle-active',
  authorize('usuarios:actualizar'),
  [param('id').isUUID()],
  validate,
  usuarioController.toggleActive
);

// PATCH /usuarios/:id/reset-password - Resetear contraseña
router.patch(
  '/:id/reset-password',
  authorize('usuarios:actualizar'),
  [
    param('id').isUUID(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  usuarioController.resetPassword
);

export default router;
