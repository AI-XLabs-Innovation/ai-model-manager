"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listGenerations } from "../lib/adminApi";

const TYPE_TABS = [
  { label: "All", value: "all" },
  { label: "Images", value: "images" },
  { label: "Videos", value: "videos" },
  { label: "Audio", value: "audios" },
  { label: "Music", value: "music" },
];

export default function GenerationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
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

  const typeBadgeColor = (t: string) => {
    switch (t) {
      case "image": return "bg-blue-100 text-blue-800";
      case "video": return "bg-purple-100 text-purple-800";
      case "audio": return "bg-green-100 text-green-800";
      case "music": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Generations</h1>
      <p className="text-sm text-gray-400 mb-6">View all AI-generated content across the platform</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setType(tab.value); setPage(1); }}
            className={`text-sm px-3 py-1.5 rounded border transition-colors ${
              type === tab.value
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
        <p className="text-gray-400">No generations found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Model</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Prompt</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-gray-400 font-medium">Preview</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={`${item.type}-${item.id}`} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeBadgeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-300 max-w-[150px] truncate">{item.model || "—"}</td>
                    <td className="py-3 px-2 text-gray-300 max-w-[250px] truncate">{item.prompt || "—"}</td>
                    <td className="py-3 px-2">
                      {item.profiles ? (
                        <Link href={`/users/${item.user_id}`} className="text-blue-400 hover:underline">
                          {item.profiles.full_name || item.profiles.email || item.user_id?.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-gray-500">{item.user_id?.slice(0, 8) || "—"}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</td>
                    <td className="py-3 px-2">
                      {(item.image_url || item.video_url || item.audio_url) ? (
                        <a
                          href={item.image_url || item.video_url || item.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-xs"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
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
              <span className="text-sm">{page} / {totalPages || 1}</span>
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
