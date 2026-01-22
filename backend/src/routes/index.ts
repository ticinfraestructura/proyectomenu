import { Router } from 'express';
import authRoutes from './auth.routes';
import usuarioRoutes from './usuario.routes';
import rolRoutes from './rol.routes';
import categoriaRoutes from './categoria.routes';
import unidadRoutes from './unidad.routes';
import tipoDesastreRoutes from './tipoDesastre.routes';
import eventoEmergenciaRoutes from './eventoEmergencia.routes';
import zonaAfectadaRoutes from './zonaAfectada.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/roles', rolRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/unidades', unidadRoutes);
router.use('/tipos-desastre', tipoDesastreRoutes);
router.use('/eventos', eventoEmergenciaRoutes);
router.use('/zonas', zonaAfectadaRoutes);

export default router;
