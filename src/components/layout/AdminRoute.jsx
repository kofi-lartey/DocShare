import { Navigate, useLocation } from 'react-router-dom';
import { getAdminSession } from '../../admin/adminApi';

// Frontend-first guard: requires a mock admin session (set by AdminLogin /
// Setup). Phase 2 will replace this with a backend `requireRole('admin')`
// check against the real admin JWT.
export default function AdminRoute({ children }) {
  const session = getAdminSession();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}
