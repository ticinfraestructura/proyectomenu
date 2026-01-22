import { Router } from 'express';
import { body, param } from 'express-validator';
import { categoriaController } from '../controllers/categoria.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /categorias - Listar todas las categorías
router.get('/', authorize('configuracion:leer'), categoriaController.findAll);

// GET /categorias/:id - Obtener categoría por ID
router.get(
  '/:id',
  authorize('configuracion:leer'),
  [param('id').isUUID()],
  validate,
  categoriaController.findById
);

// POST /categorias - Crear categoría
router.post(
  '/',
  authorize('configuracion:crear'),
  [
    body('codigo').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 100 }),
    body('descripcion').optional().trim(),
  ],
  validate,
  categoriaController.create
);

// PUT /categorias/:id - Actualizar categoría
router.put(
  '/:id',
  authorize('configuracion:actualizar'),
  [
    param('id').isUUID(),
    body('codigo').optional().trim().isLength({ min: 2, max: 50 }),
    body('nombre').optional().trim().isLength({ min: 2, max: 100 }),
    body('descripcion').optional().trim(),
    body('activo').optional().isBoolean(),
  ],
  validate,
  categoriaController.update
);

// DELETE /categorias/:id - Eliminar categoría
router.delete(
  '/:id',
  authorize('configuracion:eliminar'),
  [param('id').isUUID()],
  validate,
  categoriaController.delete
);

// PATCH /categorias/:id/toggle-active - Activar/Desactivar categoría
router.patch(
  '/:id/toggle-active',
  authorize('configuracion:actualizar'),
  [param('id').isUUID()],
  validate,
  categoriaController.toggleActive
);

export default router;
