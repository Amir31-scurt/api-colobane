import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoritesController';
import { authRequired } from '../middlewares/authMiddleware';

const router = Router();

router.post('/toggle', authRequired, toggleFavorite);
router.get('/', authRequired, getFavorites);

export default router;
