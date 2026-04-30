import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardStats, getUsers, getProjects } from '../data/demoData'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  TrendingUp,
  ListTodo,
  ArrowRight,
} from 'lucide-react'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (user) {
      const dashboardStats = getDashboardStats(user.id, isAdmin)
      setStats(dashboardStats)
    }
  }, [user, isAdmin])

  if (!stats) {
    return <div className="animate-pulse">Loading...</div>
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: ListTodo,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks,
      icon: Clock,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ]

  const users = getUsers()
  const projects = getProjects()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name}! Here is your task overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.lightColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tasks by Priority
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-700">High Priority</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.highPriority}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{
                  width: `${stats.totalTasks ? (stats.highPriority / stats.totalTasks) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-gray-700">Medium Priority</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.mediumPriority}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{
                  width: `${stats.totalTasks ? (stats.mediumPriority / stats.totalTasks) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-700">Low Priority</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.lowPriority}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${stats.totalTasks ? (stats.lowPriority / stats.totalTasks) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <Link
              to="/my-tasks"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tasks yet</p>
            ) : (
              stats.recentTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assignedTo)
                const project = projects.find((p) => p.id === task.projectId)
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        {project?.name} {assignee && `- ${assignee.name}`}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        task.status === 'Done'
                          ? 'badge-done'
                          : task.status === 'InProgress'
                          ? 'badge-inprogress'
                          : 'badge-todo'
                      }`}
                    >
                      {task.status === 'InProgress' ? 'In Progress' : task.status}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Projects
          </h2>
          <Link
            to="/projects"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.slice(0, 3).map((project) => {
            const projectTasks = stats.recentTasks?.filter(
              (t) => t.projectId === project.id
            ) || []
            const memberCount = project.members.length
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderKanban className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {memberCount} members
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-3">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {project.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
