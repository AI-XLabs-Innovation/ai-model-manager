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
    listApiKeys({ page, limit })
      .then((res) => {
        setKeys(res.data?.keys ?? []);
        setTotal(res.data?.total ?? 0);
        setTotalPages(res.data?.total_pages ?? 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, [page]);

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This action cannot be undone.")) return;
    try {
      await revokeApiKey(id);
      fetchKeys();
    } catch (e) {
      console.error(e);
      alert("Failed to revoke key");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">API Keys</h1>
      <p className="text-sm text-gray-400 mb-6">Manage all API keys issued to users for programmatic access</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <p className="text-gray-400">No API keys found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Key Prefix</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Created</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Last Used</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key: any) => (
                  <tr key={key.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 font-mono text-gray-300">{key.key_prefix || "vsk_***"}</td>
                    <td className="py-3 px-2 text-gray-300">{key.name || "—"}</td>
                    <td className="py-3 px-2">
                      {key.profiles ? (
                        <Link href={`/users/${key.user_id}`} className="text-blue-400 hover:underline">
                          {key.profiles.full_name || key.profiles.email || key.user_id?.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-gray-500">{key.user_id?.slice(0, 8) || "—"}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        key.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {key.is_active ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400">{key.created_at ? new Date(key.created_at).toLocaleDateString() : "—"}</td>
                    <td className="py-3 px-2 text-gray-400">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}</td>
                    <td className="py-3 px-2">
                      {key.is_active && (
                        <button
                          onClick={() => handleRevoke(key.id)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">{total} total</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm disabled:opacity-50"
              >Prev</button>
              <span className="text-sm">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
