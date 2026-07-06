import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

// Role-aware top navigation.
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="brand" >Store Ratings</div>
      <div className="nav-links">
        {user.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/stores">Stores</Link>
          </>
        )}
        {user.role === 'user' && <Link to="/stores">Stores</Link>}
        {user.role === 'owner' && <Link to="/owner">Dashboard</Link>}
        <Link to="/password">Change Password</Link>
        <span className="role-badge">{user.role}</span>
        <Link to="/profile" title="Edit your details">{user.name}</Link>
        <button className="secondary" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
