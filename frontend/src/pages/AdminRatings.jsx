import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import apiFetch from '../api/apiFetch';
import Table from "../components/Table";

export default function AdminRatings() {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    useEffect(() => {
        (async () => {
            try { const res = await apiFetch('/api/admin/ratings', { token: user.token }); setData(res.ratings || res); } catch (e) { console.error(e); }
        })();
    }, []);
    return (
        <div className="p-6 text-cyan-950">
            <h1 className="text-xl font-semibold mb-4">Ratings</h1>
            <Table columns={[{ key: 'store_name', title: 'Store' }, { key: 'user_email', title: 'User' }, { key: 'rating', title: 'Rating' }, { key: 'created_at', title: 'Date' }]} data={data} />
        </div>
    );
}