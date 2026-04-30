import express from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getOverdueTasks,
} from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/activity', protect, getRecentActivity);
router.get('/overdue', protect, getOverdueTasks);

export default router;
