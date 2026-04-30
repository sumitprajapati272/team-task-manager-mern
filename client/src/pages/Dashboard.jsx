import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, subValue }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, overdueRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getActivity(),
          dashboardAPI.getOverdue(),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setOverdue(overdueRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your projects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={stats?.totalProjects || 0}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          icon={CheckSquare}
          label="Total Tasks"
          value={stats?.totalTasks || 0}
          color="bg-green-100 text-green-600"
          subValue={`${stats?.completedTasks || 0} completed`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Tasks"
          value={stats?.overdueTasks || 0}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          icon={Clock}
          label="Due Soon"
          value={stats?.tasksDueSoon || 0}
          color="bg-yellow-100 text-yellow-600"
          subValue="Next 7 days"
        />
      </div>

      {/* Progress and Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Task Progress</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">
                  {stats?.todoTasks || 0}
                </p>
                <p className="text-xs text-gray-500">To Do</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.inProgressTasks || 0}
                </p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats?.completedTasks || 0}
                </p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Priority Distribution
            </h2>
            {isAdmin && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                {stats?.teamMembers} members
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600 flex-1">High Priority</span>
              <span className="text-sm font-medium">
                {stats?.priorityCounts?.high || 0}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600 flex-1">Medium Priority</span>
              <span className="text-sm font-medium">
                {stats?.priorityCounts?.medium || 0}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600 flex-1">Low Priority</span>
              <span className="text-sm font-medium">
                {stats?.priorityCounts?.low || 0}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">My Tasks</span>
              <span className="text-lg font-bold text-primary-600">
                {stats?.myTasks || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdue.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Overdue Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {overdue.slice(0, 5).map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    {task.project?.name} • Due{' '}
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <span className="badge-high">Overdue</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to="/tasks"
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {activity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activity.slice(0, 5).map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    {task.project?.name}
                    {task.assignee && ` • Assigned to ${task.assignee.name}`}
                  </p>
                </div>
                <span className={`badge-${task.status}`}>
                  {task.status === 'todo'
                    ? 'To Do'
                    : task.status === 'inprogress'
                    ? 'In Progress'
                    : 'Done'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
