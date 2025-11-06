import { useAuth } from "../auth/AuthProvider";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'system_admin') return <Navigate to="/" replace />;
    return children;
}
