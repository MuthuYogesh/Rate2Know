import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider';
import apiFetch from '../api/apiFetch';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [counts, setCounts] = useState({ users: 0, stores: 0, ratings: 0 });
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const data = await apiFetch('/api/admin/dashboard', { token: user.token });
                if (mounted) setCounts(data);
            } catch (e) { console.error(e); }
        }
        load();
        return () => mounted = false;
    }, [user]);
    return (
        <div className="p-6 text-cyan-950">
            <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded shadow">Total Users: <strong>{counts.users}</strong></div>
                <div className="p-4 bg-white rounded shadow">Total Stores: <strong>{counts.stores}</strong></div>
                <div className="p-4 bg-white rounded shadow">Total Ratings: <strong>{counts.ratings}</strong></div>
            </div>
        </div>
    );
}
