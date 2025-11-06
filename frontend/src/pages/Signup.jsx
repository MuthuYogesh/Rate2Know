import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import apiFetch from '../api/apiFetch';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    function validate() {
        if (name.length < 20 || name.length > 60) return 'Name must be 20-60 characters';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email';
        if (address.length > 400) return 'Address too long';
        if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(password)) return 'Password must be 8-16 chars, include uppercase and special char';
        return null;
    }

    async function submit(e) {
        e.preventDefault(); setErr('');
        const v = validate(); if (v) return setErr(v);
        try {
            await apiFetch('/api/auth/signup', { method: 'POST', body: { name, email, address, password } });
            navigate('/login');
        } catch (e) { setErr(e.message); }
    }

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white text-cyan-950 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Signup</h2>
            <form onSubmit={submit} className="flex flex-col gap-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="border p-2 rounded" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded" />
                <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" className="border p-2 rounded" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" />
                {err && <div className="text-red-500">{err}</div>}
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900 transform-all hover:translate-y-0.5 duration-300">Create Account</button>
            </form>
        </div>
    );
}
