import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getProjectById,
  getTasksByProject,
  getUsers,
  createTask,
  updateTask,
  deleteTask,
  addMemberToProject,
  removeMemberFromProject,
} from '../data/demoData'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Plus,
  UserPlus,
  UserMinus,
  Calendar,
  Trash2,
  Edit2,
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
  })

  const users = getUsers()

  const loadData = () => {
    const projectData = getProjectById(id)
    if (!projectData) {
      navigate('/projects')
      return
    }
    setProject(projectData)
    setTasks(getTasksByProject(id))
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleTaskSubmit = (e) => {
    e.preventDefault()
    
    if (!taskForm.title.trim()) {
      toast.error('Task title is required')
      return
    }

    if (editingTask) {
      updateTask(editingTask.id, taskForm)
      toast.success('Task updated')
    } else {
      createTask({
        ...taskForm,
        projectId: id,
        createdBy: user.id,
      })
      toast.success('Task created')
    }

    setShowTaskModal(false)
    setEditingTask(null)
    setTaskForm({
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      assignedTo: '',
      dueDate: '',
    })
    loadData()
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
    })
    setShowTaskModal(true)
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this task?')) {
      deleteTask(taskId)
      toast.success('Task deleted')
      loadData()
    }
  }

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus })
    toast.success('Task status updated')
    loadData()
  }

  const handleAddMember = (userId) => {
    addMemberToProject(id, userId)
    toast.success('Member added')
    loadData()
  }

  const handleRemoveMember = (userId) => {
    if (window.confirm('Remove this member from the project?')) {
      removeMemberFromProject(id, userId)
      toast.success('Member removed')
      loadData()
    }
  }

  if (!project) {
    return <div>Loading...</div>
  }

  const todoTasks = tasks.filter((t) => t.status === 'Todo')
  const inProgressTasks = tasks.filter((t) => t.status === 'InProgress')
  const doneTasks = tasks.filter((t) => t.status === 'Done')
  const projectMembers = project.members.map((id) => users.find((u) => u.id === id)).filter(Boolean)
  const availableMembers = users.filter((u) => !project.members.includes(u.id))

  const TaskCard = ({ task }) => {
    const assignee = users.find((u) => u.id === task.assignedTo)
    const isOverdue = task.dueDate < new Date().toISOString().split('T')[0] && task.status !== 'Done'

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          {isAdmin && (
            <div className="flex gap-1">
              <button
                onClick={() => handleEditTask(task)}
                className="p-1 text-gray-400 hover:text-blue-600"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        {task.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className={`badge badge-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          )}
        </div>
        {assignee && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              {assignee.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-600">{assignee.name}</span>
          </div>
        )}
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task.id, e.target.value)}
          className="mt-3 w-full text-xs p-2 border border-gray-200 rounded-lg"
        >
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setShowMemberModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Manage Members
              </button>
              <button
                onClick={() => {
                  setEditingTask(null)
                  setTaskForm({
                    title: '',
                    description: '',
                    status: 'Todo',
                    priority: 'Medium',
                    assignedTo: '',
                    dueDate: '',
                  })
                  setShowTaskModal(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Team Members</h3>
        <div className="flex flex-wrap gap-2">
          {projectMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
              </div>
              {isAdmin && project.members.length > 1 && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="ml-2 text-gray-400 hover:text-red-600"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-100 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Todo ({todoTasks.length})
          </h3>
          {todoTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        <div className="bg-yellow-50 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            In Progress ({inProgressTasks.length})
          </h3>
          {inProgressTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Done ({doneTasks.length})
          </h3>
          {doneTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setEditingTask(null)
        }}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="input-field min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="input-field"
              >
                <option value="Todo">Todo</option>
                <option value="InProgress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="input-field"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Member Modal */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="Manage Members"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Member
            </label>
            {availableMembers.length === 0 ? (
              <p className="text-sm text-gray-500">All users are already members</p>
            ) : (
              <div className="space-y-2">
                {availableMembers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                    <button
                      onClick={() => handleAddMember(u.id)}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
