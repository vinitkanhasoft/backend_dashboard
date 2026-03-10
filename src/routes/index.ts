import { Router } from 'express';
import authRoutes from './auth';
import bannerRoutes from './banner';
import blogRoutes from './blogRoutes';
import carRoutes from './car';
import dashboardRoutes from './dashboardRoutes';
import testimonialRoutes from './testimonialRoutes';
import newsletterRoutes from './newsletterRoutes';
import teamRoutes from './teamRoutes';
import carPlateRoutes from './carPlateRoutes';
import insuranceFinanceRoutes from './insuranceFinanceRoutes';
import { createSuccessResponse } from '../constants/apiResponses';
import { getSystemInfo, getContactInfo } from '../constants/systemInfo';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const systemInfo = getSystemInfo();
  res.status(200).json(
    createSuccessResponse('API is running', {
      ...systemInfo,
      contact: getContactInfo(),
    })
  );
});

// API routes
router.use('/auth', authRoutes);
router.use('/banners', bannerRoutes);
router.use('/blogs', blogRoutes);
router.use('/cars', carRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/team', teamRoutes);
router.use('/car-plates', carPlateRoutes);
router.use('/insurance-finance', insuranceFinanceRoutes);

export default router;
