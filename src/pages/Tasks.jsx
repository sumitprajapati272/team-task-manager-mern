import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTasks, getUsers, getProjects, updateTask, deleteTask } from '../data/demoData'
import toast from 'react-hot-toast'
import { Search, Filter, Trash2, Calendar } from 'lucide-react'

export default function Tasks() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const users = getUsers()
  const projects = getProjects()

  const loadTasks = () => {
    const data = getTasks()
    setTasks(data)
    setFilteredTasks(data)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    let result = tasks

    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter)
    }

    setFilteredTasks(result)
  }, [searchTerm, statusFilter, priorityFilter, tasks])

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus })
    toast.success('Task status updated')
    loadTasks()
  }

  const handleDelete = (taskId) => {
    if (window.confirm('Delete this task?')) {
      deleteTask(taskId)
      toast.success('Task deleted')
      loadTasks()
    }
  }

  if (!isAdmin) {
    return <div>Access denied</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        <p className="text-gray-600 mt-1">Manage all team tasks</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="Todo">Todo</option>
                <option value="InProgress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Task</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Project</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Assignee</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Priority</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Due Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No tasks found
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assignedTo)
                  const project = projects.find((p) => p.id === task.projectId)
                  const isOverdue =
                    task.dueDate < new Date().toISOString().split('T')[0] &&
                    task.status !== 'Done'

                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {project?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                              {assignee.name.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-700">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 ${
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
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {task.dueDate ? (
                          <span
                            className={`text-sm flex items-center gap-1 ${
                              isOverdue ? 'text-red-600' : 'text-gray-600'
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            {task.dueDate}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No date</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
