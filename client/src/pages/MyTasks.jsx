import { useState, useEffect } from 'react';
import { tasksAPI } from '../api/tasks';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Calendar, FolderKanban, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getMyTasks();
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(task.dueDate, task.status);
    return task.status === filter;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inprogress: tasks.filter((t) => t.status === 'inprogress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">Tasks assigned to you</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`card p-4 text-center transition-all ${
            filter === 'all' ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">All Tasks</p>
        </button>
        <button
          onClick={() => setFilter('todo')}
          className={`card p-4 text-center transition-all ${
            filter === 'todo' ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <p className="text-2xl font-bold text-gray-500">{stats.todo}</p>
          <p className="text-sm text-gray-500">To Do</p>
        </button>
        <button
          onClick={() => setFilter('inprogress')}
          className={`card p-4 text-center transition-all ${
            filter === 'inprogress' ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <p className="text-2xl font-bold text-blue-600">{stats.inprogress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`card p-4 text-center transition-all ${
            filter === 'done' ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{stats.done}</p>
          <p className="text-sm text-gray-500">Done</p>
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`card p-4 text-center transition-all ${
            filter === 'overdue' ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          <p className="text-sm text-gray-500">Overdue</p>
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}
            </h3>
            <p className="text-gray-500 mt-1">
              {filter === 'all'
                ? 'Tasks assigned to you will appear here'
                : 'No tasks match this filter'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`card p-4 ${
                isOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {task.status === 'done' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isOverdue(task.dueDate, task.status) ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : task.status === 'inprogress' ? (
                      <Clock className="w-5 h-5 text-blue-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <h3
                      className={`font-medium ${
                        task.status === 'done'
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 ml-7 mb-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 ml-7 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <FolderKanban className="w-4 h-4" />
                      {task.project?.name}
                    </div>
                    {task.dueDate && (
                      <div
                        className={`flex items-center gap-1 ${
                          isOverdue(task.dueDate, task.status)
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        {isOverdue(task.dueDate, task.status) && ' (Overdue)'}
                      </div>
                    )}
                    <span className={`badge-${task.priority}`}>{task.priority}</span>
                  </div>
                </div>

                <div className="ml-4">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer ${
                      task.status === 'todo'
                        ? 'bg-gray-100 border-gray-200'
                        : task.status === 'inprogress'
                        ? 'bg-blue-100 border-blue-200'
                        : 'bg-green-100 border-green-200'
                    }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasks;
