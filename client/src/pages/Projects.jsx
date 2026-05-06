import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import './Projects.css';

const Projects = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  if (loading || !user) return <div className="loader">Loading...</div>;

  return (
    <div className="page-container">
      <Navbar />
      <main className="dashboard-content">
        <header className="projects-header">
          <div>
            <h1>Projects</h1>
            <p>Manage your team projects and workspaces</p>
          </div>
          {user.role === 'ADMIN' && (
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
              New Project
            </button>
          )}
        </header>

        {dataLoading ? (
          <div className="loader">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <FolderKanban size={48} style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}/>
            <p>No projects found. {user.role === 'ADMIN' ? 'Create one to get started!' : 'Ask your admin to add you to a project.'}</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card glass-panel" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <span className="task-count">{project._count?.tasks || 0} tasks</span>
                </div>
                <p className="project-desc">{project.description || 'No description provided.'}</p>
                <div className="project-footer">
                  <div className="member-avatars">
                    {project.members.slice(0, 3).map((m, i) => (
                      <div key={m.user.id} className="avatar" title={m.user.name}>
                        {m.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.members.length > 3 && <div className="avatar more">+{project.members.length - 3}</div>}
                  </div>
                  <span className="owner-badge">{project.ownerId === user.id ? 'Owner' : 'Member'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal implementation can be externalized, keeping simple for now */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
              <h2>Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label>Project Name</label>
                  <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
                </div>
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label>Description</label>
                  <input type="text" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} />
                </div>
                <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                  <button type="button" className="btn-text" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
