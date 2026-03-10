import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { dashboardSearchCars, getCarSuggestions, getPopularFilters, getDashboardStats } from '../controllers/dashboardController';

const router = Router();

// Dashboard search routes
router.get('/search', authenticate, dashboardSearchCars);
router.get('/suggestions', authenticate, getCarSuggestions);
router.get('/filters', authenticate, getPopularFilters);
router.get('/stats', authenticate, getDashboardStats);

export default router;
