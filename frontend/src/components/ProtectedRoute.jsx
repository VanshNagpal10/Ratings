import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

// Guards routes by auth state and (optionally) role.
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
