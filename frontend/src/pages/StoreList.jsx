import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import apiFetch from '../api/apiFetch';

export default function StoreList() {
    const { user } = useAuth();
    const [qName, setQName] = useState('');
    const [qAddress, setQAddress] = useState('');
    const [stores, setStores] = useState([]);


    async function load() {
        try {
            const qs = new URLSearchParams({ qName, qAddress });
            const res = await apiFetch('/api/stores?' + qs.toString(), { token: user.token });
            setStores(res.stores || res);
        } catch (e) { console.error(e); }
    }
    useEffect(() => { load(); }, []);


    return (
        <div className="p-6 text-cyan-950">
            <h1 className="text-xl font-semibold mb-4">Stores</h1>
            <form onSubmit={e => { e.preventDefault(); load(); }} className="flex gap-2 mb-4">
                <input placeholder="Search name" value={qName} onChange={e => setQName(e.target.value)} className="border p-2 rounded" />
                <input placeholder="Search address" value={qAddress} onChange={e => setQAddress(e.target.value)} className="border p-2 rounded" />
                <button className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
            </form>
            <div className="grid grid-cols-3 gap-4">
                {stores.map(s => <StoreCard key={s.id} store={s} userToken={user.token} onRated={() => load()} />)}
            </div>
        </div>
    );
}