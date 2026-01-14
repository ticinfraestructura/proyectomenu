import { Router } from 'express';
import { param } from 'express-validator';
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

export default router;
