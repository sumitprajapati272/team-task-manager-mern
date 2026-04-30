// Demo data store for preview (simulates backend data)
const STORAGE_KEY = 'taskManagerData'

const defaultData = {
  users: [
    { id: '1', name: 'Admin User', email: 'admin@demo.com', role: 'admin' },
    { id: '2', name: 'Team Member', email: 'member@demo.com', role: 'member' },
    { id: '3', name: 'Jane Smith', email: 'jane@demo.com', role: 'member' },
    { id: '4', name: 'Bob Wilson', email: 'bob@demo.com', role: 'member' },
  ],
  projects: [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design',
      status: 'active',
      members: ['1', '2', '3'],
      createdBy: '1',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile application',
      status: 'active',
      members: ['1', '2', '4'],
      createdBy: '1',
      createdAt: '2024-02-01',
    },
    {
      id: '3',
      name: 'API Integration',
      description: 'Integrate third-party APIs for payment and analytics',
      status: 'active',
      members: ['1', '3'],
      createdBy: '1',
      createdAt: '2024-02-10',
    },
  ],
  tasks: [
    {
      id: '1',
      title: 'Design homepage mockups',
      description: 'Create initial mockups for the new homepage',
      status: 'Done',
      priority: 'High',
      projectId: '1',
      assignedTo: '2',
      dueDate: '2024-03-01',
      createdBy: '1',
      createdAt: '2024-01-16',
    },
    {
      id: '2',
      title: 'Implement responsive navigation',
      description: 'Build mobile-friendly navigation component',
      status: 'InProgress',
      priority: 'Medium',
      projectId: '1',
      assignedTo: '3',
      dueDate: '2024-03-15',
      createdBy: '1',
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      title: 'Set up CI/CD pipeline',
      description: 'Configure automated deployment',
      status: 'Todo',
      priority: 'High',
      projectId: '1',
      assignedTo: '2',
      dueDate: '2024-03-10',
      createdBy: '1',
      createdAt: '2024-01-25',
    },
    {
      id: '4',
      title: 'User authentication module',
      description: 'Implement secure login and registration',
      status: 'Done',
      priority: 'High',
      projectId: '2',
      assignedTo: '2',
      dueDate: '2024-02-20',
      createdBy: '1',
      createdAt: '2024-02-02',
    },
    {
      id: '5',
      title: 'Design app screens',
      description: 'Create UI designs for all mobile screens',
      status: 'InProgress',
      priority: 'Medium',
      projectId: '2',
      assignedTo: '4',
      dueDate: '2024-03-20',
      createdBy: '1',
      createdAt: '2024-02-05',
    },
    {
      id: '6',
      title: 'Payment API integration',
      description: 'Integrate Stripe payment gateway',
      status: 'Todo',
      priority: 'High',
      projectId: '3',
      assignedTo: '3',
      dueDate: '2024-02-28',
      createdBy: '1',
      createdAt: '2024-02-11',
    },
    {
      id: '7',
      title: 'Analytics dashboard',
      description: 'Build real-time analytics dashboard',
      status: 'Todo',
      priority: 'Low',
      projectId: '3',
      assignedTo: '2',
      dueDate: '2024-04-01',
      createdBy: '1',
      createdAt: '2024-02-15',
    },
  ],
}

function getData() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
  return defaultData
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Users
export function getUsers() {
  return getData().users
}

export function getUserById(id) {
  return getData().users.find((u) => u.id === id)
}

export function updateUserRole(id, role) {
  const data = getData()
  const user = data.users.find((u) => u.id === id)
  if (user) {
    user.role = role
    saveData(data)
  }
  return user
}

// Projects
export function getProjects() {
  return getData().projects
}

export function getProjectById(id) {
  return getData().projects.find((p) => p.id === id)
}

export function getProjectsForUser(userId) {
  return getData().projects.filter((p) => p.members.includes(userId))
}

export function createProject(project) {
  const data = getData()
  const newProject = {
    ...project,
    id: String(Date.now()),
    createdAt: new Date().toISOString().split('T')[0],
    status: 'active',
  }
  data.projects.push(newProject)
  saveData(data)
  return newProject
}

export function updateProject(id, updates) {
  const data = getData()
  const index = data.projects.findIndex((p) => p.id === id)
  if (index !== -1) {
    data.projects[index] = { ...data.projects[index], ...updates }
    saveData(data)
    return data.projects[index]
  }
  return null
}

export function deleteProject(id) {
  const data = getData()
  data.projects = data.projects.filter((p) => p.id !== id)
  data.tasks = data.tasks.filter((t) => t.projectId !== id)
  saveData(data)
}

export function addMemberToProject(projectId, userId) {
  const data = getData()
  const project = data.projects.find((p) => p.id === projectId)
  if (project && !project.members.includes(userId)) {
    project.members.push(userId)
    saveData(data)
  }
  return project
}

export function removeMemberFromProject(projectId, userId) {
  const data = getData()
  const project = data.projects.find((p) => p.id === projectId)
  if (project) {
    project.members = project.members.filter((m) => m !== userId)
    saveData(data)
  }
  return project
}

// Tasks
export function getTasks() {
  return getData().tasks
}

export function getTaskById(id) {
  return getData().tasks.find((t) => t.id === id)
}

export function getTasksByProject(projectId) {
  return getData().tasks.filter((t) => t.projectId === projectId)
}

export function getTasksForUser(userId) {
  return getData().tasks.filter((t) => t.assignedTo === userId)
}

export function createTask(task) {
  const data = getData()
  const newTask = {
    ...task,
    id: String(Date.now()),
    createdAt: new Date().toISOString().split('T')[0],
  }
  data.tasks.push(newTask)
  saveData(data)
  return newTask
}

export function updateTask(id, updates) {
  const data = getData()
  const index = data.tasks.findIndex((t) => t.id === id)
  if (index !== -1) {
    data.tasks[index] = { ...data.tasks[index], ...updates }
    saveData(data)
    return data.tasks[index]
  }
  return null
}

export function deleteTask(id) {
  const data = getData()
  data.tasks = data.tasks.filter((t) => t.id !== id)
  saveData(data)
}

// Dashboard stats
export function getDashboardStats(userId, isAdmin) {
  const data = getData()
  const tasks = isAdmin
    ? data.tasks
    : data.tasks.filter((t) => t.assignedTo === userId)
  const projects = isAdmin
    ? data.projects
    : data.projects.filter((p) => p.members.includes(userId))

  const today = new Date().toISOString().split('T')[0]

  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'Done').length,
    inProgressTasks: tasks.filter((t) => t.status === 'InProgress').length,
    todoTasks: tasks.filter((t) => t.status === 'Todo').length,
    overdueTasks: tasks.filter(
      (t) => t.status !== 'Done' && t.dueDate < today
    ).length,
    totalProjects: projects.length,
    highPriority: tasks.filter((t) => t.priority === 'High' && t.status !== 'Done').length,
    mediumPriority: tasks.filter((t) => t.priority === 'Medium' && t.status !== 'Done').length,
    lowPriority: tasks.filter((t) => t.priority === 'Low' && t.status !== 'Done').length,
    recentTasks: tasks.slice(-5).reverse(),
  }
}

// Reset data
export function resetData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
  return defaultData
}
