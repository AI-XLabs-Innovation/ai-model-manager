"use client";
import React, { useCallback, useEffect, useState } from "react";
import { listSlideshows, deleteAdminSlideshow } from "../lib/adminApi";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Generating", value: "generating" },
  { label: "Failed", value: "failed" },
];

export default function SlideshowsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listSlideshows({ page, limit, status: status || undefined, search: search || undefined });
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
      setTotalPages(res.data?.total_pages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slideshow and all its images? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteAdminSlideshow(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      console.error(err);
      alert("Failed to delete slideshow");
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "completed": return "bg-green-100 text-green-800";
      case "generating": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      case "partial": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Slideshows</h1>
      <p className="text-sm text-gray-400 mb-6">View and manage all user slideshows</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`text-sm px-3 py-1.5 rounded border transition-colors ${
              status === tab.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by prompt or model..."
          className="w-full max-w-md rounded border px-3 py-2 text-sm bg-white/5 border-white/10"
          onKeyDown={(e) => { if (e.key === "Enter") setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm">No slideshows found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Prompt</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Model</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Slides</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">User</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Created</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s: any) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 px-2 max-w-[200px] truncate text-gray-200" title={s.prompt}>
                    {s.prompt || "—"}
                  </td>
                  <td className="py-2 px-2 text-gray-300">{s.model || "—"}</td>
                  <td className="py-2 px-2 text-gray-300">{s.num_images ?? "—"}</td>
                  <td className="py-2 px-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-gray-400 text-xs">
                    {s.profiles?.email || s.profiles?.full_name || s.user_id?.slice(0, 8)}
                  </td>
                  <td className="py-2 px-2 text-gray-400">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      disabled={deleting === s.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {deleting === s.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-400">{total} total</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-50"
          >Prev</button>
          <span className="text-xs">Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </div>
  );
}
