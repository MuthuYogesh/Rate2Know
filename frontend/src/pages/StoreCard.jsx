import { useState } from "react";
import apiFetch from "../api/apiFetch";

export default function StoreCard({ store, userToken, onRated }) {
    const [userRating, setUserRating] = useState(store.user_rating || 0);
    const [editing, setEditing] = useState(false);
    const [err, setErr] = useState('');

    async function submitRating(r) {
        setErr('');
        try {
            const res = await apiFetch(`/api/stores/${store.id}/rating`, { method: 'POST', body: { rating: r }, token: userToken });
            setUserRating(r); setEditing(false);
            if (onRated) onRated(res);
        } catch (e) { setErr(e.message); }
    }

    return (
        <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">{store.name}</h3>
            <div className="text-sm text-gray-600">{store.address}</div>
            <div className="mt-2 flex items-center gap-4">
                <div>Overall: <strong>{store.overall_rating ?? '—'}</strong></div>
                <div>Your rating: <strong>{userRating || '—'}</strong></div>
                <div>
                    {editing ? (
                        <div className="flex items-center gap-2">
                            <RatingStars value={userRating} editable onChange={submitRating} />
                            <button onClick={() => setEditing(false)} className="px-2 py-1 border rounded">Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setEditing(true)} className="px-3 py-1 bg-blue-600 text-white rounded">{userRating ? 'Modify Rating' : 'Rate'}</button>
                    )}
                </div>
            </div>
            {err && <div className="text-red-500 mt-2">{err}</div>}
        </div>
    );
}