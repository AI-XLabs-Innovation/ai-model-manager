"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listGenerations, deleteGeneration } from "../lib/adminApi";

const TYPE_TABS = [
  { label: "All", value: "all" },
  { label: "Images", value: "images" },
  { label: "Videos", value: "videos" },
  { label: "Audio", value: "audios" },
  { label: "Music", value: "music" },
];

const TYPE_BADGE: Record<string, string> = {
  image: "badge-accent",
  video: "badge-success",
  audio: "badge-warning",
  music: "badge-danger",
};

export default function GenerationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    listGenerations({ page, limit, type, search: search || undefined })
      .then((res) => {
        setItems(res.data?.items ?? []);
        setTotal(res.data?.total ?? 0);
        setTotalPages(res.data?.total_pages ?? Math.ceil((res.data?.total ?? 0) / limit));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, type, search]);

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete this ${item.type}? This cannot be undone.`)) return;
    const key = `${item.type}-${item.id}`;
    setDeleting(key);
    try {
      await deleteGeneration(item.type, item.id);
      setItems((prev) => prev.filter((i) => `${i.type}-${i.id}` !== key));
      setTotal((t) => t - 1);
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="page-header"><h1>Generations</h1><p>All AI-generated content across the platform</p></div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {TYPE_TABS.map((tab) => (
          <button key={tab.value} onClick={() => { setType(tab.value); setPage(1); }}
            className={`btn btn-sm ${type === tab.value ? "btn-primary" : "btn-secondary"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by prompt or model..."
            className="input pl-9" onKeyDown={(e) => { if (e.key === "Enter") setPage(1); }} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
      ) : items.length === 0 ? (
        <div className="glass p-8 text-center text-[var(--muted)]">No generations found.</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>Type</th><th>Model</th><th>Prompt</th><th>User</th><th>Date</th><th>Preview</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td><span className={`badge ${TYPE_BADGE[item.type] || "badge-muted"}`}>{item.type}</span></td>
                  <td className="text-[var(--muted-foreground)] max-w-[150px] truncate">{item.model || "--"}</td>
                  <td className="max-w-[250px] truncate">{item.prompt || "--"}</td>
                  <td>{item.profiles ? <Link href={`/users/${item.user_id}`} className="text-[var(--accent-light)] hover:underline text-xs">{item.profiles.full_name || item.profiles.email || item.user_id?.slice(0, 8)}</Link> : <span className="text-[var(--muted)] text-xs">{item.user_id?.slice(0, 8) || "--"}</span>}</td>
                  <td className="text-[var(--muted)] whitespace-nowrap">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "--"}</td>
                  <td>{(item.image_url || item.video_url || item.audio_url) ? <a href={item.image_url || item.video_url || item.audio_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">View</a> : <span className="text-[var(--muted)] text-xs">--</span>}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === `${item.type}-${item.id}`}
                      className="btn btn-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {deleting === `${item.type}-${item.id}` ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination justify-between">
        <span className="text-xs text-[var(--muted)]">{total.toLocaleString()} total</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
          <span className="text-xs self-center text-[var(--muted)]">{page} / {totalPages || 1}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
}
