import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Layout, Users, Shield } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="landing-nav glass-panel">
        <div className="logo">
          <CheckCircle className="logo-icon" />
          <span>TaskMaster</span>
        </div>
        <div className="nav-actions">
          <button className="btn-text" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Manage your team's work with <span className="highlight">precision.</span>
          </h1>
          <p className="hero-subtitle">
            A powerful, intuitive task manager built for modern teams. Assign tasks, track progress, and ship faster with role-based access control.
          </p>
          <div className="hero-cta">
            <button className="btn-primary btn-large" onClick={() => navigate('/login')}>
              Start for free
            </button>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <Layout className="feature-icon" />
            <h3>Kanban Boards</h3>
            <p>Visualize your project's progress from Todo to Done effortlessly.</p>
          </div>
          <div className="feature-card glass-panel">
            <Users className="feature-icon" />
            <h3>Team Collaboration</h3>
            <p>Invite members to projects and assign tasks with specific due dates.</p>
          </div>
          <div className="feature-card glass-panel">
            <Shield className="feature-icon" />
            <h3>Role-Based Access</h3>
            <p>Keep your data secure. Admins create tasks, members update statuses.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
