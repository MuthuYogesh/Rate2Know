import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import apiFetch from "../api/apiFetch";

export default function StoreOwnerDashboard() {
  const { user } = useAuth();
  const [storeInfo, setStoreInfo] = useState({ average: 0, raters: [] });
  useEffect(() => {
    (async () => {
      try { const res = await apiFetch('/api/store-owner/dashboard', { token: user.token }); setStoreInfo(res); } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="p-6 text-cyan-950">
      <h1 className="text-xl font-semibold mb-4">My Store</h1>
      <div className="mb-4">Average Rating: <strong>{storeInfo.average ?? '—'}</strong></div>
      <h2 className="font-semibold">Raters</h2>
      <ul className="mt-2">
        {storeInfo.raters.map(r => (
          <li key={r.user_id} className="p-2 border-b">{r.user_name} — {r.rating}</li>
        ))}
      </ul>
    </div>
  );
}