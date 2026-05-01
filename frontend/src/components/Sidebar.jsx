import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/tasks', label: 'Tasks', icon: '📋' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <BrandLogo size={38} />
        <div className="sidebar-logo-text">
          TeamTask
          <span>Project Manager</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div className="user-card-info">
            <div className="user-card-name">{user?.name}</div>
            <div className="user-card-email">{user?.email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏏</button>
        </div>
      </div>
    </aside>
  );
}
