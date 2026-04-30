import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUsers, updateUserRole, getTasksForUser, getProjectsForUser } from '../data/demoData'
import toast from 'react-hot-toast'
import { Users, Shield, User, FolderKanban, CheckSquare } from 'lucide-react'

export default function Team() {
  const { isAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])

  const loadUsers = () => {
    const data = getUsers()
    setUsers(data)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = (userId, newRole) => {
    if (userId === currentUser.id) {
      toast.error('You cannot change your own role')
      return
    }
    updateUserRole(userId, newRole)
    toast.success('User role updated')
    loadUsers()
  }

  if (!isAdmin) {
    return <div>Access denied</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600 mt-1">Manage team members and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Total Members</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'admin').length}
              </p>
              <p className="text-sm text-gray-500">Admins</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'member').length}
              </p>
              <p className="text-sm text-gray-500">Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Member
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Projects
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  Tasks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((member) => {
                const memberProjects = getProjectsForUser(member.id)
                const memberTasks = getTasksForUser(member.id)
                const completedTasks = memberTasks.filter(
                  (t) => t.status === 'Done'
                ).length

                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.name}
                            {member.id === currentUser.id && (
                              <span className="ml-2 text-xs text-gray-400">(You)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={member.id === currentUser.id}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg border-0 ${
                          member.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        } ${
                          member.id === currentUser.id
                            ? 'cursor-not-allowed opacity-60'
                            : ''
                        }`}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FolderKanban className="w-4 h-4" />
                        <span>{memberProjects.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckSquare className="w-4 h-4" />
                        <span>
                          {completedTasks}/{memberTasks.length}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Info */}
      <div className="card bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-800 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin
            </p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>Create, edit, and delete projects</li>
              <li>Manage team members</li>
              <li>Create and assign tasks</li>
              <li>View all tasks and projects</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-800 flex items-center gap-2">
              <User className="w-4 h-4" /> Member
            </p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>View assigned projects</li>
              <li>Update task status</li>
              <li>View own tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
