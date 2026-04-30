import Task from '../models/Task.model.js';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    let projectFilter = {};
    let taskFilter = {};

    // For non-admin users, only show their projects/tasks
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);
      projectFilter._id = { $in: projectIds };
      taskFilter.project = { $in: projectIds };
    }

    // Get counts
    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);

    // Task status counts
    const taskStatusCounts = await Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      todo: 0,
      inprogress: 0,
      done: 0,
    };

    taskStatusCounts.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    // Overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: today },
      status: { $ne: 'done' },
    });

    // Tasks due soon (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasksDueSoon = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $gte: today, $lte: nextWeek },
      status: { $ne: 'done' },
    });

    // My tasks count (for current user)
    const myTasks = await Task.countDocuments({
      assignee: req.user._id,
      status: { $ne: 'done' },
    });

    // Team members count (admin only)
    let teamMembers = 0;
    if (req.user.role === 'admin') {
      teamMembers = await User.countDocuments();
    }

    // Priority distribution
    const priorityDistribution = await Task.aggregate([
      { $match: { ...taskFilter, status: { $ne: 'done' } } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
    };

    priorityDistribution.forEach((item) => {
      priorityCounts[item._id] = item.count;
    });

    res.json({
      totalProjects,
      totalTasks,
      completedTasks: statusCounts.done,
      todoTasks: statusCounts.todo,
      inProgressTasks: statusCounts.inprogress,
      overdueTasks,
      tasksDueSoon,
      myTasks,
      teamMembers,
      priorityCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
export const getRecentActivity = async (req, res, next) => {
  try {
    let taskFilter = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);
      taskFilter.project = { $in: projectIds };
    }

    // Get recent tasks
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignee', 'name')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json(recentTasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue tasks
// @route   GET /api/dashboard/overdue
// @access  Private
export const getOverdueTasks = async (req, res, next) => {
  try {
    let taskFilter = {
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    };

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);
      taskFilter.project = { $in: projectIds };
    }

    const overdueTasks = await Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .sort({ dueDate: 1 });

    res.json(overdueTasks);
  } catch (error) {
    next(error);
  }
};
