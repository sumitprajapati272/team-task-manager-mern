import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Demo users for preview (since we don't have a real backend in v0)
const DEMO_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Team Member',
    email: 'member@demo.com',
    password: 'member123',
    role: 'member',
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Demo login - in production this would call the API
    const foundUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    )
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      }
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', 'demo-token-' + foundUser.id)
      setUser(userData)
      return { success: true }
    }
    
    return { success: false, error: 'Invalid email or password' }
  }

  const register = async (name, email, password) => {
    // Demo register - creates a new user (first user is admin)
    const existingUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]')
    
    if (existingUsers.find((u) => u.email === email) || DEMO_USERS.find((u) => u.email === email)) {
      return { success: false, error: 'Email already exists' }
    }
    
    const newUser = {
      id: String(Date.now()),
      name,
      email,
      password,
      role: existingUsers.length === 0 ? 'admin' : 'member',
    }
    
    existingUsers.push(newUser)
    localStorage.setItem('demoUsers', JSON.stringify(existingUsers))
    
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    }
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', 'demo-token-' + newUser.id)
    setUser(userData)
    
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
