import { Router } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import rolRoutes from './rol.routes';
import categoriaRoutes from './categoria.routes';
import unidadRoutes from './unidad.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/roles', rolRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/unidades', unidadRoutes);

export default router;
