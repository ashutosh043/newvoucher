import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return isAdmin ? children : <Navigate to="/admin-login" />;
}