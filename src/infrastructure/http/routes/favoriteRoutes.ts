import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoritesController';
import { requireAuth } from '../middlewares/auth/requireAuth';

const router = Router();

router.post('/toggle', requireAuth, toggleFavorite);
router.get('/', requireAuth, getFavorites);

export default router;
