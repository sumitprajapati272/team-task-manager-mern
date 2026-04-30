import Task from '../models/Task.model.js';
import Project from '../models/Project.model.js';

// @desc    Get tasks (with filters)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { project, status, assignee, priority } = req.query;

    let filter = {};

    // Filter by project
    if (project) {
      filter.project = project;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by assignee
    if (assignee) {
      filter.assignee = assignee;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // For non-admin users, only show tasks from their projects
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);
      filter.project = { $in: projectIds };

      if (project) {
        filter.project = project;
      }
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, project, assignee } = req.body;

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      project,
      assignee,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to update
    const project = await Project.findById(task.project);
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee?.toString() === req.user._id.toString();

    // Members can only update status of tasks assigned to them
    if (!isAdmin && !isOwner) {
      if (isMember || isAssignee) {
        // Members can only update status
        const allowedUpdates = ['status'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every((update) =>
          allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
          return res.status(403).json({
            message: 'Members can only update task status',
          });
        }
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const { title, description, status, priority, dueDate, assignee } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignee !== undefined) task.assignee = assignee;

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
