"use client";
import React, { useEffect, useState } from "react";
import { getLandingMedia, addLandingMedia, deleteLandingMedia } from "../lib/adminApi";

export default function LandingMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrls, setNewUrls] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchMedia = () => { setLoading(true); getLandingMedia().then((res) => setMedia(res.data?.media ?? [])).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchMedia(); }, []);

  const handleAdd = async () => {
    const urls = newUrls.split(/[\n,]/).map((u) => u.trim()).filter(Boolean);
    if (!urls.length) return;
    setAdding(true);
    try { await addLandingMedia(urls); setNewUrls(""); fetchMedia(); } catch { alert("Failed to add"); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    try { await deleteLandingMedia(id); fetchMedia(); } catch { alert("Failed to delete"); }
  };

  return (
    <div>
      <div className="page-header"><h1>Landing Media</h1><p>Manage media on the explore/landing page</p></div>

      <div className="glass p-5 mb-6">
        <h2 className="text-xs font-semibold mb-2">Add Media</h2>
        <textarea value={newUrls} onChange={(e) => setNewUrls(e.target.value)} placeholder="Paste media URLs (one per line or comma-separated)..." className="input" rows={3} style={{ resize: "vertical" }} />
        <button onClick={handleAdd} disabled={adding || !newUrls.trim()} className="btn btn-primary btn-sm mt-2">{adding ? "Adding..." : "Add Media"}</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-40" />)}</div>
      ) : media.length === 0 ? (
        <div className="glass p-8 text-center text-[var(--muted)]">No landing media found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((item: any) => (
            <div key={item.id} className="glass overflow-hidden group relative">
              {item.video_url?.match(/\.(mp4|webm|mov)$/i) ? (
                <video src={item.video_url} className="w-full h-40 object-cover" muted loop playsInline
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.video_url} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Open</a>
                <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Delete</button>
              </div>
              <div className="px-3 py-2 text-[10px] text-[var(--muted)] flex justify-between">
                <span>Order: {item.sort_order}</span>
                <span>{item.section}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
