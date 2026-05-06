import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, UserPlus, Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  // Forms
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [newMemberId, setNewMemberId] = useState('');

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProject();
      if (user.role === 'ADMIN') fetchUsers();
    }
  }, [id, user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task created');
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      fetchProject();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { userId: newMemberId });
      toast.success('Member added');
      setIsMemberModalOpen(false);
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchProject();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading || dataLoading) return <div className="loader">Loading...</div>;
  if (!project) return null;

  const isAdmin = user.id === project.ownerId || user.role === 'ADMIN';

  const renderColumn = (status, title, icon) => {
    const columnTasks = project.tasks.filter(t => t.status === status);
    return (
      <div className="kanban-column">
        <div className="column-header">
          {icon}
          <h3>{title} <span className="task-count">{columnTasks.length}</span></h3>
        </div>
        <div className="task-cards">
          {columnTasks.map(task => (
            <div key={task.id} className="task-card glass-panel">
              <h4>{task.title}</h4>
              <p className="task-desc">{task.description}</p>
              <div className="task-meta">
                <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                {task.assignee && (
                  <div className="avatar-small" title={task.assignee.name}>
                    {task.assignee.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="task-actions">
                <select 
                  value={task.status} 
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  disabled={task.assigneeId !== user.id && !isAdmin}
                  className="status-select"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <Navbar />
      <main className="dashboard-content project-detail">
        <header className="projects-header">
          <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          <div className="header-actions">
            <div className="member-avatars" style={{marginRight: '1rem'}}>
              {project.members.map(m => (
                <div key={m.user.id} className="avatar" title={m.user.name}>{m.user.name.charAt(0)}</div>
              ))}
            </div>
            {isAdmin && (
              <>
                <button className="btn-secondary" onClick={() => setIsMemberModalOpen(true)}>
                  <UserPlus size={18} style={{marginRight: '8px'}}/> Add Member
                </button>
                <button className="btn-primary" onClick={() => setIsTaskModalOpen(true)}>
                  <Plus size={18} style={{marginRight: '8px'}}/> Create Task
                </button>
              </>
            )}
          </div>
        </header>

        <div className="kanban-board">
          {renderColumn('TODO', 'To Do', <Circle size={18} color="var(--text-secondary)" />)}
          {renderColumn('IN_PROGRESS', 'In Progress', <Clock size={18} color="var(--accent)" />)}
          {renderColumn('DONE', 'Done', <CheckCircle2 size={18} color="var(--success)" />)}
          {renderColumn('OVERDUE', 'Overdue', <AlertCircle size={18} color="var(--danger)" />)}
        </div>

        {/* Task Modal */}
        {isTaskModalOpen && (
          <div className="modal-overlay" onClick={() => setIsTaskModalOpen(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label>Title</label>
                  <input type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                </div>
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label>Description</label>
                  <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows="3" />
                </div>
                <div className="form-row" style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Priority</label>
                    <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Due Date</label>
                    <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                  </div>
                </div>
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label>Assignee</label>
                  <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                  <button type="button" className="btn-text" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Member Modal */}
        {isMemberModalOpen && (
          <div className="modal-overlay" onClick={() => setIsMemberModalOpen(false)}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
              <h2>Add Team Member</h2>
              <form onSubmit={handleAddMember}>
                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label>Select User</label>
                  <select value={newMemberId} onChange={e => setNewMemberId(e.target.value)} required>
                    <option value="">Choose a user...</option>
                    {users.filter(u => !project.members.some(m => m.user.id === u.id)).map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                  <button type="button" className="btn-text" onClick={() => setIsMemberModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Add Member</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ProjectDetail;
