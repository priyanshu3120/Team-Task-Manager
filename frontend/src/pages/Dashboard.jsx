import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const map = { todo: ['badge-todo', 'To Do'], 'in-progress': ['badge-progress', 'In Progress'], done: ['badge-done', 'Done'] };
  const [cls, label] = map[status] || ['badge-todo', status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

const PriorityBadge = ({ priority }) => {
  const map = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };
  return <span className={`badge ${map[priority] || 'badge-medium'}`}>{priority}</span>;
};

function isOverdue(task) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;

  const { stats, myTasks, recentTasks } = data || {};

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div className="page-header">
        <h2>👋 Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p>Here's an overview of your team's progress</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card indigo">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{stats?.totalProjects ?? 0}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats?.totalTasks ?? 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats?.inProgressTasks ?? 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats?.doneTasks ?? 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">🔴</div>
          <div className="stat-value">{stats?.overdueTasks ?? 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="section">
          <div className="section-header">
            <span className="section-title">My Assigned Tasks</span>
            <Link to="/tasks" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {myTasks?.length === 0 && <div className="empty"><div className="empty-icon">🎉</div><h3>All caught up!</h3></div>}
          {myTasks?.map(task => (
            <div key={task._id} className="task-card" style={{ marginBottom: 10 }}>
              <div className="task-card-title">{task.title}</div>
              <div className="task-card-meta">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.project && <span className="text-muted">📁 {task.project.name}</span>}
              </div>
              {task.dueDate && (
                <div className={`due-date mt-1 ${isOverdue(task) ? 'due-overdue' : ''}`}>
                  📅 Due {new Date(task.dueDate).toLocaleDateString()} {isOverdue(task) && '⚠️ Overdue'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="section">
          <div className="section-header">
            <span className="section-title">Recent Activity</span>
          </div>
          {recentTasks?.length === 0 && <div className="empty"><div className="empty-icon">📭</div><h3>No activity yet</h3></div>}
          {recentTasks?.map(task => (
            <div key={task._id} className="task-card" style={{ marginBottom: 10 }}>
              <div className="flex-between">
                <div className="task-card-title">{task.title}</div>
                <StatusBadge status={task.status} />
              </div>
              <div className="task-card-meta mt-1">
                {task.project && <span className="text-muted text-sm">📁 {task.project.name}</span>}
                {task.assignee && (
                  <span className="assignee-chip">
                    👤 {task.assignee.name}
                  </span>
                )}
              </div>
              <div className="due-date mt-1">
                Created {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
