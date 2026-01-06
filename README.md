# Task Management & Time Tracking Dashboard

A modern, scalable, and professional task management and time tracking system for software houses delivering Web and Mobile App Development services.

## Features

### User Roles
- **Admin / Project Manager**: Full access to all features, can manage clients, projects, tasks, and team members
- **Developer (Freelancer / In-house)**: Can view assigned tasks and track time

### Core Features
- **Client Management**: Manage Upwork and direct clients
- **Project Management**: Create and manage projects with team assignments
- **Task Management**: Create task sheets with priority, estimated hours, and assignments
- **Time Tracking**: Start/stop timer, manual entries, task history with multiple sessions
- **Dashboard & Analytics**: Project/task/time reports with role-based views
- **Dark/Light Mode**: Modern UI with theme support
- **Notifications**: Task assignments and updates

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based secure authentication
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **UI Components**: Headless UI + Heroicons

## Project Structure

```
task-dashboard/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Express middleware
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Utility functions
│   │   └── seeds/                 # Database seed data
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── ui/                # Reusable UI components
│   │   │   ├── layout/            # Layout components
│   │   │   └── dashboard/         # Dashboard components
│   │   ├── pages/                 # Page components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API service functions
│   │   ├── stores/                # Zustand stores
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/task_dashboard?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

5. Generate Prisma client and run migrations:
```bash
npm run db:generate
npm run db:push
```

6. Seed the database with sample data:
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`
API Documentation: `http://localhost:3001/api/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## API Documentation

The API documentation is available via Swagger UI at `/api/docs` when the backend is running.

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

#### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/developers` - List all developers
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Clients (Admin only)
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client details
- `POST /api/clients` - Create client
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (Admin)
- `PATCH /api/projects/:id` - Update project (Admin)
- `POST /api/projects/:id/members` - Add member (Admin)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Admin)

#### Tasks
- `GET /api/tasks` - List tasks
- `GET /api/tasks/my` - Get my assigned tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task (Admin)
- `PATCH /api/tasks/:id` - Update task
- `POST /api/tasks/:id/comments` - Add comment

#### Time Entries
- `GET /api/time-entries` - List time entries
- `GET /api/time-entries/active` - Get active timer
- `POST /api/time-entries/start` - Start timer
- `POST /api/time-entries/stop` - Stop timer
- `POST /api/time-entries/manual` - Create manual entry
- `GET /api/time-entries/stats` - Get time statistics

#### Dashboard
- `GET /api/dashboard` - Get role-based dashboard
- `GET /api/dashboard/admin` - Admin dashboard
- `GET /api/dashboard/developer` - Developer dashboard
- `GET /api/dashboard/team` - Team overview
- `GET /api/dashboard/notifications` - Get notifications

## Test Accounts

After running the seed script, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskdashboard.com | admin123 |
| Project Manager | pm@taskdashboard.com | manager123 |
| Developer | john@taskdashboard.com | developer123 |
| Developer | jane@taskdashboard.com | developer123 |

## Database Schema

### Main Tables
- `users` - User accounts with roles
- `clients` - Client information (Upwork/Direct)
- `projects` - Project details
- `project_members` - Project-user assignments
- `tasks` - Task details with status and priority
- `time_entries` - Time tracking records
- `task_comments` - Task comments
- `activity_logs` - User activity history
- `notifications` - User notifications

## Deployment

### Environment Variables

#### Backend
```env
DATABASE_URL=postgresql://...
JWT_SECRET=production-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### Build Commands

Backend:
```bash
npm run build
npm start
```

Frontend:
```bash
npm run build
```

The frontend build output will be in the `dist` folder, ready for deployment to any static hosting service.

### Deployment Platforms
- **Backend**: Railway, Render, AWS ECS, Heroku
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, Railway PostgreSQL, Supabase

## License

MIT License

## Support

For issues and feature requests, please create an issue in the repository.
