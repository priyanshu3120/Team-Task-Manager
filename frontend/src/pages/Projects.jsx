import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await api.post('/projects', form);
      setShowModal(false); setForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create project');
    } finally { setSaving(false); }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div className="flex-between mb-4">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>📁 Projects</h2>
          <p>Manage your team's projects</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && <div className="loader-wrap"><div className="spinner" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>
      )}

      <div className="projects-grid">
        {filtered.map(project => {
          const allMembers = [project.owner, ...(project.members || [])];
          return (
            <div key={project._id} className="project-card" onClick={() => navigate(`/projects/${project._id}`)}
              style={{ cursor: 'pointer' }}>
              <div className="project-card-name">{project.name}</div>
              <div className="project-card-desc">{project.description || 'No description provided'}</div>
              <div className="project-card-meta">
                <div className="member-avatars">
                  {allMembers.slice(0, 4).map((m, i) => (
                    <div key={i} className="member-avatar-sm" title={m?.name}>
                      {m?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  ))}
                  {allMembers.length > 4 && (
                    <div className="member-avatar-sm" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                      +{allMembers.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-muted text-sm">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title="Create New Project" onClose={() => setShowModal(false)}>
          <form className="modal-form" onSubmit={handleCreate}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label>Project Name *</label>
              <input id="project-name-input" placeholder="e.g. Website Redesign" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="What is this project about?" rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="save-project-btn" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
