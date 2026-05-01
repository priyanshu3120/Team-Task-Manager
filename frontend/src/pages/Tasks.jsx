import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const map = { todo: ['badge-todo', 'To Do'], 'in-progress': ['badge-progress', 'In Progress'], done: ['badge-done', 'Done'] };
  const [cls, label] = map[status] || ['badge-todo', status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const PriBadge = ({ p }) => {
  const c = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' }[p] || 'badge-medium';
  return <span className={`badge ${c}`}>{p}</span>;
};

function isOverdue(t) { return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'; }

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const fetchTasks = () => {
    setLoading(true);
    api.get('/tasks').then(r => setTasks(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    setTasks(ts => ts.map(t => t._id === taskId ? { ...t, status } : t));
  };

  const handleDelete = async taskId => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks(ts => ts.filter(t => t._id !== taskId));
  };

  const filtered = tasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div className="page-header">
        <h2>📋 Tasks</h2>
        <p>All tasks across your projects</p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search tasks…" value={filters.search} onChange={e => setFilter('search', e.target.value)} />
        </div>
        <select className="filter" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="filter" value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {(filters.status || filters.priority || filters.search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', priority: '', search: '' })}>✕ Clear</button>
        )}
      </div>

      {loading && <div className="loader-wrap"><div className="spinner" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create tasks from a project</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    {task.description && <div className="text-muted text-sm" style={{ marginTop: 2 }}>{task.description.slice(0, 50)}{task.description.length > 50 ? '…' : ''}</div>}
                  </td>
                  <td>
                    {task.project ? (
                      <span style={{ background: 'var(--surface2)', borderRadius: 6, padding: '3px 8px', fontSize: 12 }}>
                        📁 {task.project.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {task.assignee ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
                          {task.assignee.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13 }}>{task.assignee.name}</span>
                      </div>
                    ) : <span className="text-muted">Unassigned</span>}
                  </td>
                  <td><PriBadge p={task.priority} /></td>
                  <td>
                    {task.dueDate ? (
                      <span className={isOverdue(task) ? 'due-overdue' : 'text-muted'} style={{ fontSize: 13 }}>
                        {new Date(task.dueDate).toLocaleDateString()} {isOverdue(task) && '⚠️'}
                      </span>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                      style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
