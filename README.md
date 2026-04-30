# Team Task Manager - MERN Stack

A full-stack team task management application built with MongoDB, Express.js, React, and Node.js (MERN stack).

## Features

- **Authentication**: JWT-based signup/login with bcrypt password hashing
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Create/edit/delete projects, manage members, create/edit/delete tasks
  - **Member**: View assigned projects, update task status on assigned tasks
- **Task Management**: Todo/InProgress/Done status, priority levels, due dates
- **Dashboard**: Total/completed/overdue task statistics
- **Projects**: Create projects, assign team members

## Project Structure

```
team-task-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios API calls
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & validation middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/team` - Get team members (for dropdowns)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects (filtered by access)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)
- `POST /api/projects/:id/members` - Add member (Admin)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Admin)

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/my-tasks` - Get tasks assigned to current user
- `GET /api/tasks/project/:projectId` - Get tasks by project
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Admin)
- `PUT /api/tasks/:id` - Update task (Admin can update all, Members can update status only)
- `DELETE /api/tasks/:id` - Delete task (Admin)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity
- `GET /api/dashboard/overdue` - Get overdue tasks

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd team-task-manager
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

Or use the install script:
```bash
npm run install-all
```

### 3. Configure environment variables

Create `server/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

### 4. Start the application

**Development mode (both client and server):**
```bash
npm run dev
```

**Server only:**
```bash
npm run server
```

**Client only:**
```bash
npm run client
```

### 5. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Behavior

- The **first user** to register becomes an **Admin**
- Subsequent users become **Members** by default
- Admins can promote members to admin role

## Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **react-hot-toast** - Notifications

## License

MIT
"# team-task-manager-mern" 
