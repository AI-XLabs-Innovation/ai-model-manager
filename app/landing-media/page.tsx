"use client";
import React, { useEffect, useState } from "react";
import { getLandingMedia, addLandingMedia, deleteLandingMedia } from "../lib/adminApi";

export default function LandingMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrls, setNewUrls] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchMedia = () => {
    setLoading(true);
    getLandingMedia()
      .then((res) => setMedia(res.data?.media ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleAdd = async () => {
    const urls = newUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    setAdding(true);
    try {
      await addLandingMedia(urls);
      setNewUrls("");
      fetchMedia();
    } catch (e) {
      console.error(e);
      alert("Failed to add media");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    try {
      await deleteLandingMedia(id);
      fetchMedia();
    } catch (e) {
      console.error(e);
      alert("Failed to delete media");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Landing Media</h1>
      <p className="text-sm text-gray-400 mb-6">Manage media displayed on the landing/explore page</p>

      {/* Add new media */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold mb-2">Add Media</h2>
        <textarea
          value={newUrls}
          onChange={(e) => setNewUrls(e.target.value)}
          placeholder="Paste media URLs (one per line or comma-separated)..."
          className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm"
          rows={3}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newUrls.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add Media"}
        </button>
      </div>

      {/* Media grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <p className="text-gray-400">No landing media found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item: any) => (
            <div key={item.id} className="relative group border border-white/10 rounded-lg overflow-hidden bg-black">
              {item.video_url?.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={item.video_url}
                  className="w-full h-40 object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.video_url} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white text-black px-2 py-1 rounded"
                >
                  Open
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
              <div className="p-2 text-xs text-gray-400">
                <span>Order: {item.sort_order}</span>
                <span className="ml-2">{item.section}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
