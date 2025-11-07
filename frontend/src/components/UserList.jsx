import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider';
import apiFetch from '../api/apiFetch';
import Table from './Table';

export default function UserList() {
    const { user } = useAuth();
    const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
    const [data, setData] = useState([]);
    const [err, setErr] = useState('');

    const load = async () => {
        try {
            const q = new URLSearchParams(filters);
            const res = await apiFetch('/api/admin/users?' + q.toString(), { token: user.token });
            setData(res.users || res);
        } catch (e) { setErr(e.message); }
    }

    useEffect(() => {
        console.log(user);
        load();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        load();
    }

    return (
        <div className="p-6 text-cyan-950">
            <h1 className="text-xl font-semibold mb-4">Users</h1>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input placeholder="Name" value={filters.name} onChange={e => setFilters(s => ({ ...s, name: e.target.value }))} className="border p-2 rounded" />
                <input placeholder="Email" value={filters.email} onChange={e => setFilters(s => ({ ...s, email: e.target.value }))} className="border p-2 rounded" />
                <input placeholder="Address" value={filters.address} onChange={e => setFilters(s => ({ ...s, address: e.target.value }))} className="border p-2 rounded" />
                <select value={filters.role} onChange={e => setFilters(s => ({ ...s, role: e.target.value }))} className="border p-2 rounded">
                    <option value="">Any Role</option>
                    <option value="system_admin">Admin</option>
                    <option value="normal_user">Normal</option>
                    <option value="store_owner">Store Owner</option>
                </select>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">Filter</button>
            </form>
            {err && <div className="text-red-500">{err}</div>}
            <Table columns={[{ key: 'name', title: 'Name' }, { key: 'email', title: 'Email' }, { key: 'address', title: 'Address' }, { key: 'role', title: 'Role' }]} data={data} />
        </div>
    );
}
