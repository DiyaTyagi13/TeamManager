# Team Task Manager

A full-stack team collaboration tool with role-based access control, built strictly to assignment requirements.

## 🚀 Live Demo
*(Insert your Railway Live URL here after deployment)*

## 🏗️ Tech Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (via Prisma ORM)
- **Deployment**: Railway (Monolithic Architecture)

## ✨ Key Features
- **Authentication**: Secure JWT-based signup and login flows.
- **Project & Team Management**: Users can create projects and become default Admins.
- **Role-Based Access Control (RBAC)**: 
  - **Admins** can add members and create tasks.
  - **Members** can view projects and update the statuses of their assigned tasks.
- **Task Tracking**: Tasks support priorities (Low, Medium, High) and statuses (Todo, In Progress, Done, Overdue).
- **Dashboard**: Real-time aggregation of task statuses across all assigned projects.

## ⚙️ Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd team-task-manager
   ```

2. **Install Dependencies**
   The root `package.json` manages both client and server installations.
   ```bash
   npm run install
   ```

3. **Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   JWT_SECRET="your_super_secret_jwt_key"
   PORT=5000
   ```

4. **Database Migration**
   Push the Prisma schema to your PostgreSQL database.
   ```bash
   cd server
   npx prisma db push
   ```

5. **Start Development Servers**
   Open two terminal windows:
   
   *Terminal 1 (Backend)*
   ```bash
   cd server
   npm run dev
   ```

   *Terminal 2 (Frontend)*
   ```bash
   cd client
   npm run dev
   ```

## 🚄 Railway Deployment Instructions

This repository is pre-configured for a **Zero-Config Deployment** on Railway.

1. Push this repository to GitHub.
2. Log into [Railway.app](https://railway.app) and click **New Project**.
3. Select **Provision PostgreSQL**.
4. Click **New** again and select **GitHub Repo**, then select your repository.
5. In the repository settings on Railway, go to **Variables** and add:
   - `DATABASE_URL` (Reference the Postgres variable Railway generated).
   - `JWT_SECRET` (Add a strong random string).
6. Railway will automatically detect the root `package.json`, build the React frontend, generate the Prisma client, and start the Express server.

---
*Built for the Full-Stack Developer Assessment.*
