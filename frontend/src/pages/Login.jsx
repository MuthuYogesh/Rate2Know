import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import apiFetch from "../api/apiFetch";

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault(); setErr('');
        try {
            const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
            // backend should return { token, user }
            login({ ...data.user, token: data.token });
            // redirect based on role
            if (data.user.role === 'system_admin') navigate('/admin');
            else if (data.user.role === 'normal_user') navigate('/stores');
            else if (data.user.role === 'store_owner') navigate('/owner/dashboard');
        } catch (e) { setErr(e.message); }
    }

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow text-cyan-950">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={submit} className="flex flex-col gap-3">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="p-2 rounded border" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" />
                {err && <div className="text-red-500">{err}</div>}
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-400 transform-all hover:translate-y-0.5 duration-300">Login</button>
            </form>
        </div>
    );
}
