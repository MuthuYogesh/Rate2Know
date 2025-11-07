import React from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const doLogout = () => { logout(); navigate('/login'); }
    return (
        <div className="flex bg-white text-cyan-900 shadow p-4 items-center justify-between">
            <Link to="/" className="font-bold text-2xl">Rate <span className='text-4xl text-fuchsia-950'>2</span> Know</Link>
            <div className="flex items-center justify-evenly gap-4">

                {user && user.role === 'system_admin' && (
                    <>
                        <Link to="/admin" className="text-lg font-bold hover:text-red-400">Home</Link>
                        <Link to="/admin/users" className="text-lg font-bold hover:text-red-400">Users</Link>
                        <Link to="/admin/stores" className="text-lg font-bold hover:text-red-400">Stores</Link>
                        <Link to="/admin/ratings" className="text-lg font-bold hover:text-red-400">Ratings</Link>
                    </>
                )}
                {user && user.role === 'normal_user' && (
                    <Link to="/stores" className="text-lg font-bold hover:text-red-400">Stores</Link>
                )}
                {user && user.role === 'store_owner' && (
                    <Link to="/owner/dashboard" className="text-lg hover:text-red-400">My Store</Link>
                )}
            </div>
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-sm">{user.name} | ({user.role})</span>
                        <Link to="/settings" className="text-sm">change password</Link>
                        <button onClick={doLogout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm">Login</Link>
                        <Link to="/signup" className="text-sm">Signup</Link>
                    </>
                )}
            </div>
        </div>
    );
}
