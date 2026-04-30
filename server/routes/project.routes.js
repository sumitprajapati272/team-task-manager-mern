import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/project.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { projectValidation, mongoIdValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', protect, getProjects);
router.get('/:id', protect, mongoIdValidation, getProjectById);
router.post('/', protect, adminOnly, projectValidation, createProject);
router.put('/:id', protect, adminOnly, mongoIdValidation, updateProject);
router.delete('/:id', protect, adminOnly, mongoIdValidation, deleteProject);
router.post('/:id/members', protect, adminOnly, addMember);
router.delete('/:id/members/:userId', protect, adminOnly, removeMember);

export default router;
