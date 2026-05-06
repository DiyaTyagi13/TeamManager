import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/" className="logo">
          <CheckCircle className="logo-icon" />
          <span>TaskMaster</span>
        </Link>
      </div>

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/projects" className="nav-link">
              <FolderKanban size={18} />
              Projects
            </Link>
            <div className="nav-user">
              <span className="user-name">{user.name}</span>
              <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
              <button onClick={handleLogout} className="btn-icon" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-text">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
