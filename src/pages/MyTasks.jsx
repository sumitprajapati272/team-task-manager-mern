import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTasksForUser, getProjects, updateTask } from '../data/demoData'
import toast from 'react-hot-toast'
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export default function MyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')

  const projects = getProjects()

  const loadTasks = () => {
    const data = getTasksForUser(user.id)
    setTasks(data)
  }

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus })
    toast.success('Task status updated')
    loadTasks()
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">Track your assigned tasks</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('all')}
          className={`card cursor-pointer transition-all ${
            filter === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              <p className="text-sm text-gray-500">Total Tasks</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilter('Todo')}
          className={`card cursor-pointer transition-all ${
            filter === 'Todo' ? 'ring-2 ring-gray-500' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter((t) => t.status === 'Todo').length}
              </p>
              <p className="text-sm text-gray-500">Todo</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilter('InProgress')}
          className={`card cursor-pointer transition-all ${
            filter === 'InProgress' ? 'ring-2 ring-yellow-500' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter((t) => t.status === 'InProgress').length}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilter('Done')}
          className={`card cursor-pointer transition-all ${
            filter === 'Done' ? 'ring-2 ring-green-500' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter((t) => t.status === 'Done').length}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No tasks</h3>
            <p className="text-gray-500 mt-1">
              {filter === 'all'
                ? 'You have no tasks assigned yet'
                : `No ${filter === 'InProgress' ? 'in progress' : filter.toLowerCase()} tasks`}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId)
            const isOverdue = task.dueDate < today && task.status !== 'Done'

            return (
              <div
                key={task.id}
                className={`card ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-gray-500">
                        {project?.name || 'Unknown Project'}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`text-sm flex items-center gap-1 ${
                            isOverdue ? 'text-red-600' : 'text-gray-500'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          {task.dueDate}
                        </span>
                      )}
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`font-medium px-4 py-2 rounded-lg border-0 ${
                        task.status === 'Done'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'InProgress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="Todo">Todo</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
