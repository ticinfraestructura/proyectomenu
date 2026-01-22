import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { productoController } from '../controllers/producto.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

// GET /productos - Listar todos los productos
router.get(
  '/',
  authorize('inventario:leer'),
  [
    query('includeInactive').optional().isBoolean(),
    query('categoriaId').optional().isUUID(),
    query('search').optional().isString(),
  ],
  validate,
  productoController.findAll
);

// GET /productos/:id - Obtener producto por ID
router.get(
  '/:id',
  authorize('inventario:leer'),
  [param('id').isUUID()],
  validate,
  productoController.findById
);

// POST /productos - Crear producto
router.post(
  '/',
  authorize('inventario:crear'),
  [
    body('codigo').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('nombre').notEmpty().trim().isLength({ min: 2, max: 200 }),
    body('categoriaId').isUUID(),
    body('unidadMedidaId').isUUID(),
    body('stockMinimo').isInt({ min: 0 }),
    body('stockActual').isInt({ min: 0 }),
    body('perecedero').isBoolean(),
    body('fechaVencimiento').optional().isISO8601().toDate(),
    body('descripcion').optional().trim(),
  ],
  validate,
  productoController.create
);

// PUT /productos/:id - Actualizar producto
router.put(
  '/:id',
  authorize('inventario:actualizar'),
  [
    param('id').isUUID(),
    body('codigo').optional().trim().isLength({ min: 2, max: 50 }),
    body('nombre').optional().trim().isLength({ min: 2, max: 200 }),
    body('categoriaId').optional().isUUID(),
    body('unidadMedidaId').optional().isUUID(),
    body('stockMinimo').optional().isInt({ min: 0 }),
    body('stockActual').optional().isInt({ min: 0 }),
    body('perecedero').optional().isBoolean(),
    body('fechaVencimiento').optional().isISO8601().toDate(),
    body('descripcion').optional().trim(),
    body('activo').optional().isBoolean(),
  ],
  validate,
  productoController.update
);

// DELETE /productos/:id - Eliminar producto
router.delete(
  '/:id',
  authorize('inventario:eliminar'),
  [param('id').isUUID()],
  validate,
  productoController.delete
);

// PATCH /productos/:id/toggle-active - Activar/Desactivar producto
router.patch(
  '/:id/toggle-active',
  authorize('inventario:actualizar'),
  [param('id').isUUID()],
  validate,
  productoController.toggleActive
);

// POST /productos/:id/adjust-stock - Ajustar stock
router.post(
  '/:id/adjust-stock',
  authorize('inventario:actualizar'),
  [
    param('id').isUUID(),
    body('cantidad').isInt({ min: 1 }),
    body('tipo').isIn(['entrada', 'salida']),
    body('bodegaId').isUUID(),
    body('observaciones').optional().trim(),
  ],
  validate,
  productoController.adjustStock
);

export default router;
