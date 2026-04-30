import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getProjects,
  getProjectsForUser,
  createProject,
  deleteProject,
  getUsers,
  getTasksByProject,
} from '../data/demoData'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import {
  FolderKanban,
  Plus,
  Users,
  CheckSquare,
  Trash2,
  Calendar,
} from 'lucide-react'

export default function Projects() {
  const { user, isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const users = getUsers()

  const loadProjects = () => {
    const data = isAdmin ? getProjects() : getProjectsForUser(user.id)
    setProjects(data)
  }

  useEffect(() => {
    loadProjects()
  }, [user, isAdmin])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    createProject({
      ...formData,
      members: [user.id],
      createdBy: user.id,
    })

    toast.success('Project created successfully')
    setShowModal(false)
    setFormData({ name: '', description: '' })
    loadProjects()
  }

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId)
      toast.success('Project deleted')
      loadProjects()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage all team projects' : 'Your assigned projects'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? 'Create your first project to get started'
              : 'You are not assigned to any projects yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const tasks = getTasksByProject(project.id)
            const completedTasks = tasks.filter((t) => t.status === 'Done').length
            const memberNames = project.members
              .map((id) => users.find((u) => u.id === id)?.name)
              .filter(Boolean)
              .slice(0, 3)

            return (
              <div key={project.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FolderKanban className="w-6 h-6 text-blue-600" />
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Link to={`/projects/${project.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mt-4 hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{project.members.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <CheckSquare className="w-4 h-4" />
                    <span>
                      {completedTasks}/{tasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{project.createdAt}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex -space-x-2">
                    {memberNames.map((name, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                        title={name}
                      >
                        {name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter project name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field min-h-[100px]"
              placeholder="Enter project description"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
