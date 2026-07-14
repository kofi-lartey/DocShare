import { useAuth } from '../../contexts/AuthContext';
import { getAdminSession } from '../adminApi';

// Gate UI by permission scope. The Administrator (superuser) inherits every
// standard user privilege and additionally owns `admin.*` scopes. During the
// frontend-first phase we resolve role from the mock admin session.
export default function PermissionGate({ scope = 'admin.*', fallback = null, children }) {
  const { user } = useAuth();
  const session = getAdminSession();

  const isSuperuser = session?.role === 'admin' || user?.role === 'admin';

  if (scope === 'admin.*') {
    return isSuperuser ? children : fallback;
  }

  // Granular: admin always passes; otherwise deny.
  return isSuperuser ? children : fallback;
}
