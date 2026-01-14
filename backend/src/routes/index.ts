import { Router } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import rolRoutes from './rol.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/roles', rolRoutes);

export default router;
