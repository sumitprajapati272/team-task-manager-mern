import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTeamMembers,
} from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { mongoIdValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/team', protect, getTeamMembers);
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, mongoIdValidation, getUserById);
router.put('/:id', protect, adminOnly, mongoIdValidation, updateUser);
router.delete('/:id', protect, adminOnly, mongoIdValidation, deleteUser);

export default router;
