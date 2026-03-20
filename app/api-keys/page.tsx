"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listApiKeys, revokeApiKey } from "../lib/adminApi";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchKeys = () => {
    setLoading(true);
    listApiKeys({ page, limit }).then((res) => {
      setKeys(res.data?.keys ?? []); setTotal(res.data?.total ?? 0); setTotalPages(res.data?.total_pages ?? 1);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, [page]);

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try { await revokeApiKey(id); fetchKeys(); } catch { alert("Failed to revoke key"); }
  };

  return (
    <div>
      <div className="page-header"><h1>API Keys</h1><p>Manage API keys for programmatic access ({total} total)</p></div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
      ) : keys.length === 0 ? (
        <div className="glass p-8 text-center text-[var(--muted)]">No API keys found.</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>Key Prefix</th><th>Name</th><th>User</th><th>Status</th><th>Created</th><th>Last Used</th><th></th></tr></thead>
            <tbody>
              {keys.map((key: any) => (
                <tr key={key.id}>
                  <td className="font-mono text-xs">{key.key_prefix || "vsk_***"}</td>
                  <td>{key.name || "--"}</td>
                  <td>{key.profiles ? <Link href={`/users/${key.user_id}`} className="text-[var(--accent-light)] hover:underline text-xs">{key.profiles.full_name || key.profiles.email || key.user_id?.slice(0, 8)}</Link> : <span className="text-[var(--muted)] text-xs">{key.user_id?.slice(0, 8)}</span>}</td>
                  <td><span className={`badge ${key.is_active ? "badge-success" : "badge-danger"}`}>{key.is_active ? "Active" : "Revoked"}</span></td>
                  <td className="text-[var(--muted)]">{key.created_at ? new Date(key.created_at).toLocaleDateString() : "--"}</td>
                  <td className="text-[var(--muted)]">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}</td>
                  <td>{key.is_active && <button onClick={() => handleRevoke(key.id)} className="btn btn-danger btn-sm">Revoke</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination justify-between">
          <span className="text-xs text-[var(--muted)]">{total} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
            <span className="text-xs self-center text-[var(--muted)]">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
