import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, done: 0, inProgress: 0, todo: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const fetchDashboard = async () => {
        try {
          const res = await api.get('/dashboard');
          setStats(res.data.stats);
          setRecentTasks(res.data.myTasks);
        } catch (error) {
          console.error('Error fetching dashboard', error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchDashboard();
    }
  }, [user]);

  if (loading || !user) return <div className="loader">Loading...</div>;

  return (
    <div className="page-container">
      <Navbar />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
          <p>Here's what's happening with your tasks today.</p>
        </header>

        {dataLoading ? (
          <div className="loader">Loading stats...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-icon todo"><Circle size={24} /></div>
                <div className="stat-info">
                  <h3>To Do</h3>
                  <p className="stat-value">{stats.todo}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon in-progress"><Clock size={24} /></div>
                <div className="stat-info">
                  <h3>In Progress</h3>
                  <p className="stat-value">{stats.inProgress}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon done"><CheckCircle2 size={24} /></div>
                <div className="stat-info">
                  <h3>Completed</h3>
                  <p className="stat-value">{stats.done}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon overdue"><AlertCircle size={24} /></div>
                <div className="stat-info">
                  <h3>Overdue</h3>
                  <p className="stat-value">{stats.overdue}</p>
                </div>
              </div>
            </div>

            <section className="recent-tasks glass-panel">
              <div className="section-header">
                <h2>Your Upcoming Tasks</h2>
              </div>
              {recentTasks.length === 0 ? (
                <div className="empty-state">
                  <p>You have no assigned tasks. Go to Projects to get started.</p>
                </div>
              ) : (
                <div className="task-list">
                  {recentTasks.map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-main">
                        <span className={`status-dot ${task.status.toLowerCase()}`}></span>
                        <div>
                          <h4>{task.title}</h4>
                          <span className="project-name">{task.project?.name}</span>
                        </div>
                      </div>
                      <div className="task-meta">
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <span className="due-date">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
