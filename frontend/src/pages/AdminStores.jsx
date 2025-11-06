import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import apiFetch from '../api/apiFetch';
import Table from '../components/Table';

export default function AdminStores() {
    const { user } = useAuth();
    const [filters, setFilters] = useState({ name: '', email: '', address: '' });
    const [data, setData] = useState([]);
    useEffect(() => {
        (async () => {
            try { const q = new URLSearchParams(filters); const res = await apiFetch('/api/admin/stores?' + q.toString(), { token: user.token }); setData(res.stores || res); } catch (e) { console.error(e); }
        })();
    }, []);

    return (
        <div className="p-6 text-cyan-950">
            <h1 className="text-xl font-semibold mb-4">Stores</h1>
            <Table columns={[{ key: 'name', title: 'Name' }, { key: 'email', title: 'Email' }, { key: 'address', title: 'Address' }, { key: 'rating', title: 'Rating' }]} data={data} />
        </div>
    );
}