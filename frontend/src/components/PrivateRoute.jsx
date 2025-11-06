import { useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider';


export default function PrivateRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
}
