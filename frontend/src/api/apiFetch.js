const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default async function apiFetch(path, { method = 'GET', body, token } = {}) {
    const opts = { method, headers: {} };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Server error' }));
        throw new Error(err.error || err.message || 'Request failed');
    }
    return res.json();
}