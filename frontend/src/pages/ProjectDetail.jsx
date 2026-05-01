import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const STATUS_ICONS  = { todo: '📋', 'in-progress': '⚡', done: '✅' };

function isOverdue(t) { return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'; }

const PriBadge = ({ p }) => {
  const c = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' }[p] || 'badge-medium';
  return <span className={`badge ${c}`}>{p}</span>;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [memberEmail, setMemberEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editProject, setEditProject] = useState(false);
  const [projForm, setProjForm] = useState({ name: '', description: '' });

  const isAdmin = project?.owner?._id === user?._id || project?.owner === user?._id;

  const load = async () => {
    try {
      const [pRes, tRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks?projectId=${id}`)]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setProjForm({ name: pRes.data.name, description: pRes.data.description || '' });
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleCreateTask = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/tasks', { ...taskForm, projectId: id });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', status: 'todo' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    setTasks(ts => ts.map(t => t._id === taskId ? { ...t, status } : t));
  };

  const handleDeleteTask = async taskId => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks(ts => ts.filter(t => t._id !== taskId));
  };

  const handleAddMember = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const { data } = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(data); setMemberEmail(''); setShowMemberModal(false);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleRemoveMember = async userId => {
    if (!window.confirm('Remove this member?')) return;
    const { data } = await api.delete(`/projects/${id}/members/${userId}`);
    setProject(data);
  };

  const handleUpdateProject = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put(`/projects/${id}`, projForm);
      setProject(data); setEditProject(false);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  const allMembers = project ? [project.owner, ...(project.members || [])] : [];

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      {/* Header */}
      <div className="flex-between mb-4">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 8 }}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>{project?.name}</h2>
          {project?.description && <p className="text-muted" style={{ marginTop: 4 }}>{project.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setEditProject(true)}>✏️ Edit</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(true)}>👥 Members</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ Task</button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>🗑️</button>
          </div>
        )}
      </div>

      {/* Members strip */}
      <div className="card mb-4" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div className="flex gap-2" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="text-muted text-sm">Team:</span>
          {allMembers.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', borderRadius: 99, padding: '4px 10px' }}>
              <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{m?.name?.[0]?.toUpperCase()}</div>
              <span style={{ fontSize: 13 }}>{m?.name}</span>
              {isAdmin && m?._id !== user?._id && (
                <button onClick={() => handleRemoveMember(m._id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
              )}
              {m?._id === project?.owner?._id && <span className="badge badge-progress" style={{ fontSize: 10 }}>Admin</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban">
        {STATUSES.map(col => {
          const colTasks = tasks.filter(t => t.status === col);
          return (
            <div key={col} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">
                  {STATUS_ICONS[col]} {STATUS_LABELS[col]}
                  <span className="kanban-count">{colTasks.length}</span>
                </span>
              </div>
              {colTasks.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>No tasks</div>
              )}
              {colTasks.map(task => (
                <div key={task._id} className="task-card">
                  <div className="task-card-title">{task.title}</div>
                  {task.description && <div className="task-card-desc">{task.description}</div>}
                  <div className="task-card-meta">
                    <PriBadge p={task.priority} />
                    {task.assignee && (
                      <span className="assignee-chip">👤 {task.assignee.name}</span>
                    )}
                  </div>
                  {task.dueDate && (
                    <div className={`due-date mt-1 ${isOverdue(task) ? 'due-overdue' : ''}`}>
                      📅 {new Date(task.dueDate).toLocaleDateString()} {isOverdue(task) && '⚠️'}
                    </div>
                  )}
                  <div className="task-card-footer">
                    <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                      style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <Modal title="Create New Task" onClose={() => setShowTaskModal(false)}>
          <form className="modal-form" onSubmit={handleCreateTask}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label>Title *</label>
              <input id="task-title-input" placeholder="Task title" value={taskForm.title}
                onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={2} placeholder="Optional description" value={taskForm.description}
                onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={taskForm.assignee} onChange={e => setTaskForm(p => ({ ...p, assignee: e.target.value }))}>
                <option value="">Unassigned</option>
                {allMembers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <Modal title="Manage Members" onClose={() => setShowMemberModal(false)}>
          <form className="modal-form" onSubmit={handleAddMember}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label>Add member by email</label>
              <input id="member-email-input" type="email" placeholder="member@example.com"
                value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Close</button>
              <button id="add-member-btn" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Project Modal */}
      {editProject && (
        <Modal title="Edit Project" onClose={() => setEditProject(false)}>
          <form className="modal-form" onSubmit={handleUpdateProject}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label>Project Name *</label>
              <input value={projForm.name} onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={projForm.description}
                onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditProject(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
