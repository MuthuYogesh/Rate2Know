// src/components/StoreCard.jsx
import React, { useState } from "react";
import apiFetch from "../api/apiFetch";
import RatingStar from "../components/RatingStar";

export default function StoreCard({ store, userToken, onRated }) {
    const initial = (typeof store?.user_rating === 'number' && !Number.isNaN(store.user_rating)) ? store.user_rating : 0;
    const [userRating, setUserRating] = useState(initial);
    const [editing, setEditing] = useState(false);
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    async function submitRating(r) {
        setErr('');
        setLoading(true);
        try {
            const res = await apiFetch(`/api/stores/${store.id}/rating`, {
                method: 'POST',
                body: { rating: r },
                token: userToken
            });
            setUserRating(r);
            setEditing(false);
            if (typeof onRated === 'function') onRated(res);
            setLoading(false);
            return res;
        } catch (e) {
            const msg = e?.body?.error || e?.body?.message || e?.message || 'Failed to submit rating';
            setErr(msg);
            setLoading(false);
            throw e;
        }
    }

    const handleStarChange = (newValue) => {
        submitRating(newValue).catch(() => {
            setEditing(true);
        });
    };

    return (
        <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">{store?.name}</h3>
            <div className="text-sm text-gray-600">{store?.address}</div>

            <div className="mt-2 flex flex-col items-center gap-4">
                <div className="flex justify-between gap-24">
                    <div>Overall: <strong>{store?.overall_rating ?? '—'}</strong></div>
                    <div>Your rating: <strong>{userRating || '—'}</strong></div>
                </div>
                <div>
                    {editing ? (
                        <div className="flex flex-col items-center gap-2">
                            <RatingStar
                                value={userRating}
                                editable={!loading}
                                precision={1}
                                size="medium"
                                onChange={handleStarChange}
                            />
                            <button
                                onClick={() => { setEditing(false); setErr(''); }}
                                className="px-2 py-1 border rounded"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => setEditing(true)}
                                className="px-3 py-1 bg-blue-600 text-white rounded"
                            >
                                {userRating ? 'Modify Rating' : 'Rate'}
                            </button>
                            <div className="ml-2">
                                <RatingStar value={userRating} editable={false} precision={1} size="small" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {err && <div className="text-red-500 mt-2">{err}</div>}
        </div>
    );
}
