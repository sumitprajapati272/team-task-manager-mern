import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
  getMyTasks,
} from '../controllers/task.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import {
  taskValidation,
  taskUpdateValidation,
  mongoIdValidation,
} from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/my-tasks', protect, getMyTasks);
router.get('/project/:projectId', protect, getTasksByProject);
router.get('/', protect, getTasks);
router.get('/:id', protect, mongoIdValidation, getTaskById);
router.post('/', protect, adminOnly, taskValidation, createTask);
router.put('/:id', protect, mongoIdValidation, taskUpdateValidation, updateTask);
router.delete('/:id', protect, adminOnly, mongoIdValidation, deleteTask);

export default router;
