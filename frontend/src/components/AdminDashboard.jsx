import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import apiFetch from '../api/apiFetch';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const UUID_SIMPLE = /^[0-9a-fA-F-]{36}$/;
const ALLOWED_ROLES = ['system_admin', 'normal_user', 'store_owner'];

/**
 * Validate user form data.
 * Returns: { valid: boolean, errors: { fieldName: message|null, ... } }
 */
function validateUser({ name, email, address, password, role }) {
    const errors = {
        name: null,
        email: null,
        address: null,
        password: null,
        role: null
    };

    if (!name || typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
        errors.name = 'Name must be between 20 and 60 characters.';
    }

    if (!email || !EMAIL_REGEX.test(email)) {
        errors.email = 'Enter a valid email address.';
    }

    if (address && address.length > 400) {
        errors.address = 'Address must be 400 characters or less.';
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
        errors.password = 'Password must be 8-16 chars, include at least one uppercase and one special character.';
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
        errors.role = 'Role must be one of: system_admin, normal_user, store_owner.';
    }

    const valid = !Object.values(errors).some(Boolean);
    return { valid, errors };
}

/**
 * Validate store form data.
 * Returns: { valid: boolean, errors: { fieldName: message|null, ... } }
 */
function validateStore({ name, email, address, owner_id }) {
    const errors = {
        name: null,
        email: null,
        address: null,
        owner_id: null
    };

    if (!name || !name.trim()) {
        errors.name = 'Store name is required.';
    }

    if (email && !EMAIL_REGEX.test(email)) {
        errors.email = 'Enter a valid email address.';
    }

    if (address && address.length > 400) {
        errors.address = 'Address must be 400 characters or less.';
    }

    if (owner_id && !UUID_SIMPLE.test(owner_id.trim())) {
        errors.owner_id = 'Owner ID looks invalid. Provide a UUID or leave blank.';
    }

    const valid = !Object.values(errors).some(Boolean);
    return { valid, errors };
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [counts, setCounts] = useState({ users: 0, stores: 0, ratings: 0 });

    // modal toggles
    const [isAddUser, setIsAddUser] = useState(false);
    const [isAddStore, setIsAddStore] = useState(false);

    // user form state
    const [uName, setUName] = useState('');
    const [uEmail, setUEmail] = useState('');
    const [uAddress, setUAddress] = useState('');
    const [uPassword, setUPassword] = useState('');
    const [uRole, setURole] = useState('normal_user');
    const [uLoading, setULoading] = useState(false);
    const [uErrors, setUErrors] = useState({});
    const [uSuccess, setUSuccess] = useState(null);

    // store form state
    const [sName, setSName] = useState('');
    const [sEmail, setSEmail] = useState('');
    const [sAddress, setSAddress] = useState('');
    const [sOwnerId, setSOwnerId] = useState('');
    const [sLoading, setSLoading] = useState(false);
    const [sErrors, setSErrors] = useState({});
    const [sSuccess, setSSuccess] = useState(null);

    useEffect(() => {
        let mounted = true;
        console.log(user);
        async function load() {
            try {
                const data = await apiFetch('/api/admin/dashboard', { token: user.token });
                if (mounted) setCounts(data);
            } catch (e) {
                console.error('Failed to load dashboard counts', e);
            }
        }
        load();
        return () => { mounted = false; };
    }, [user]);

    async function refreshCounts() {
        try {
            const data = await apiFetch('/api/admin/dashboard', { token: user.token });
            setCounts(data);
        } catch (e) {
            console.error('refresh failed', e);
        }
    }

    // Create user
    const handleAddUser = async (e) => {
        e?.preventDefault?.();
        setUErrors({});
        setUSuccess(null);
        console.log(user.token);

        const payload = {
            name: uName.trim(),
            email: uEmail.trim(),
            address: uAddress ? uAddress.trim() : undefined,
            password: uPassword,
            role: uRole
        };

        const { valid, errors } = validateUser(payload);
        if (!valid) {
            setUErrors(errors);
            return;
        }

        setULoading(true);
        try {
            const res = await apiFetch('/api/admin/users', {
                method: 'POST',
                body: payload,
                token: user.token
            });

            setUSuccess(`User created: ${res.user?.email || res.user?.name || 'created'}`);
            // reset form
            setUName(''); setUEmail(''); setUAddress(''); setUPassword(''); setURole('normal_user');
            setIsAddUser(false);
            await refreshCounts();
        } catch (err) {
            console.error('create user error', err);
            // try to map server errors to field errors when possible
            const serverMsg = err?.body?.error || err?.body?.message || err?.message || 'Failed to create user';
            // If server returns field-level errors in err.body.errors (express-validator style), map them
            if (err?.body?.errors && Array.isArray(err.body.errors)) {
                const mapped = {};
                for (const eItem of err.body.errors) {
                    if (eItem.param) mapped[eItem.param] = eItem.msg;
                }
                setUErrors(mapped);
            } else {
                // assign general error to top-level
                setUErrors({ _global: serverMsg });
            }
        } finally {
            setULoading(false);
        }
    };

    // Create store
    const handleAddStore = async (e) => {
        e?.preventDefault?.();
        setSErrors({});
        setSSuccess(null);

        const payload = {
            name: sName.trim(),
            email: sEmail ? sEmail.trim() : undefined,
            address: sAddress ? sAddress.trim() : undefined,
            owner_id: sOwnerId ? sOwnerId.trim() : undefined
        };

        const { valid, errors } = validateStore(payload);
        if (!valid) {
            setSErrors(errors);
            return;
        }

        setSLoading(true);
        try {
            const res = await apiFetch('/api/admin/stores', {
                method: 'POST',
                body: payload,
                token: user.token
            });

            setSSuccess(`Store created: ${res.store?.name || 'created'}`);
            setSName(''); setSEmail(''); setSAddress(''); setSOwnerId('');
            setIsAddStore(false);
            await refreshCounts();
        } catch (err) {
            console.error('create store error', err);
            const serverMsg = err?.body?.error || err?.body?.message || err?.message || 'Failed to create store';
            if (err?.body?.errors && Array.isArray(err.body.errors)) {
                const mapped = {};
                for (const eItem of err.body.errors) {
                    if (eItem.param) mapped[eItem.param] = eItem.msg;
                }
                setSErrors(mapped);
            } else {
                setSErrors({ _global: serverMsg });
            }
        } finally {
            setSLoading(false);
        }
    };

    return (
        <div className="flex flex-col p-6 text-cyan-950">
            <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white rounded shadow">Total Users: <strong>{counts.users}</strong></div>
                <div className="p-4 bg-white rounded shadow">Total Stores: <strong>{counts.stores}</strong></div>
                <div className="p-4 bg-white rounded shadow">Total Ratings: <strong>{counts.ratings}</strong></div>
            </div>

            <div className="flex items-start gap-4 mb-6">
                <button className="p-3 bg-cyan-800 text-white rounded shadow" onClick={() => { setIsAddUser(true); setIsAddStore(false); }}>
                    Add User
                </button>
                <button className="p-3 bg-red-800 text-white rounded shadow" onClick={() => { setIsAddStore(true); setIsAddUser(false); }}>
                    Add Store
                </button>
            </div>

            {/* Add User Modal */}
            {isAddUser && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
                    <div className="w-full max-w-xl bg-white rounded p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Create User</h2>
                            <button className="text-gray-600" onClick={() => setIsAddUser(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Full name (20–60 chars)</label>
                                <input
                                    value={uName}
                                    onChange={(e) => setUName(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Full name"
                                />
                                {uErrors.name && <div className="text-red-600 text-sm mt-1">{uErrors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    value={uEmail}
                                    onChange={(e) => setUEmail(e.target.value)}
                                    type="email"
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="email@example.com"
                                />
                                {uErrors.email && <div className="text-red-600 text-sm mt-1">{uErrors.email}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Address (optional)</label>
                                <textarea
                                    value={uAddress}
                                    onChange={(e) => setUAddress(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Address (max 400 chars)"
                                    rows={3}
                                />
                                {uErrors.address && <div className="text-red-600 text-sm mt-1">{uErrors.address}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Password</label>
                                <input
                                    value={uPassword}
                                    onChange={(e) => setUPassword(e.target.value)}
                                    type="password"
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="8-16 chars, uppercase & special"
                                />
                                {uErrors.password && <div className="text-red-600 text-sm mt-1">{uErrors.password}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Role</label>
                                <select value={uRole} onChange={(e) => setURole(e.target.value)} className="w-full border px-3 py-2 rounded">
                                    <option value="normal_user">normal_user</option>
                                    <option value="store_owner">store_owner</option>
                                    <option value="system_admin">system_admin</option>
                                </select>
                                {uErrors.role && <div className="text-red-600 text-sm mt-1">{uErrors.role}</div>}
                            </div>

                            {uErrors._global && <div className="text-red-600">{uErrors._global}</div>}
                            {uSuccess && <div className="text-green-600">{uSuccess}</div>}

                            <div className="flex gap-3 justify-end">
                                <button type="button" className="px-4 py-2 rounded border" onClick={() => setIsAddUser(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-cyan-800 text-white" disabled={uLoading}>
                                    {uLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Store Modal */}
            {isAddStore && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
                    <div className="w-full max-w-lg bg-white rounded p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Create Store</h2>
                            <button className="text-gray-600" onClick={() => setIsAddStore(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddStore} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium">Store Name</label>
                                <input
                                    value={sName}
                                    onChange={(e) => setSName(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Store name"
                                />
                                {sErrors.name && <div className="text-red-600 text-sm mt-1">{sErrors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Email (optional)</label>
                                <input
                                    value={sEmail}
                                    onChange={(e) => setSEmail(e.target.value)}
                                    type="email"
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="store@example.com"
                                />
                                {sErrors.email && <div className="text-red-600 text-sm mt-1">{sErrors.email}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Address (optional)</label>
                                <textarea
                                    value={sAddress}
                                    onChange={(e) => setSAddress(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Address (max 400 chars)"
                                    rows={3}
                                />
                                {sErrors.address && <div className="text-red-600 text-sm mt-1">{sErrors.address}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium">Owner ID (optional)</label>
                                <input
                                    value={sOwnerId}
                                    onChange={(e) => setSOwnerId(e.target.value)}
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="UUID of owner (optional)"
                                />
                                {sErrors.owner_id && <div className="text-red-600 text-sm mt-1">{sErrors.owner_id}</div>}
                                <p className="text-xs text-gray-500 mt-1">Optional: link this store to a store owner by UUID.</p>
                            </div>

                            {sErrors._global && <div className="text-red-600">{sErrors._global}</div>}
                            {sSuccess && <div className="text-green-600">{sSuccess}</div>}

                            <div className="flex gap-3 justify-end">
                                <button type="button" className="px-4 py-2 rounded border" onClick={() => setIsAddStore(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-red-800 text-white" disabled={sLoading}>
                                    {sLoading ? 'Creating...' : 'Create Store'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
