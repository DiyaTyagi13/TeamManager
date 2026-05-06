# Team Task Manager

A full-stack team collaboration and project management tool built with Node.js, Express, React, and Prisma. This application was built to fulfill assignment requirements, featuring robust Role-Based Access Control (RBAC) and a monolithic deployment architecture on Railway.

## 🏗️ Tech Stack
- **Frontend**: React, Vite, Axios, React Router, Lucide React (Icons)
- **Backend**: Node.js, Express, Express-Validator, JSON Web Tokens (JWT), Bcrypt
- **Database**: PostgreSQL (via Prisma ORM)
- **Deployment**: Railway (Monolithic Architecture)

## ✨ Key Features
- **Authentication**: Secure JWT-based signup and login flows. Users can register as either an `Administrator` or a `Team Member`.
- **Project Management**: Administrators can create new projects and manage the overall structure.
- **Team Management**: Project admins can invite registered users to join their specific projects.
- **Task Creation & Assignment**: Admins can create tasks, set priorities (Low, Medium, High), define due dates, and assign them to specific team members.
- **Status Tracking**: Interactive Kanban-style dashboard for tasks (To Do, In Progress, Done, Overdue). Members can update the status of tasks assigned to them.
- **Role-Based Access Control (RBAC)**: 
  - `Administrators`: Full access to create projects, invite members, and manage tasks.
  - `Members`: Restricted access. Can only view projects they are assigned to and update statuses for their own assigned tasks.

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or managed)

### 1. Database Setup
1. Create a PostgreSQL database.
2. In the `server` directory, create a `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
   JWT_SECRET="your_secret_key"
   PORT=5000
   ```

### 2. Backend Setup
```bash
cd server
npm install
npx prisma db push
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🚂 Railway Deployment
This project is configured for a **Zero-Config Monolithic Deployment** on Railway.
1. Push the repository to GitHub.
2. Connect the repository to a new Railway project.
3. Add a PostgreSQL database plugin in Railway.
4. In your Application block variables, link the `DATABASE_URL` using the magic wand icon and add a `JWT_SECRET`.
5. Railway will automatically install dependencies, build the React frontend, generate the Prisma client, push the database schema, and serve the full application from a single URL!

## 📝 License
ISC License
