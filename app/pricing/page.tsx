"use client";
import React, { useEffect, useState, useMemo } from "react";
import { getPricing } from "../lib/adminApi";
import { formatBilling } from "../components/ModelList";

const CATEGORY_LABELS: Record<string, string> = {
  image: "Image", video: "Video", audio: "Audio / TTS", lipsync: "Lipsync",
  image_upscale: "Image Upscale", video_upscale: "Video Upscale", background_removal: "BG Removal",
};

export default function PricingPage() {
  const [pricingData, setPricingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("image");
  const [search, setSearch] = useState("");

  useEffect(() => { getPricing().then((res) => setPricingData(res.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const categories = useMemo(() => pricingData?.content_type ? Object.keys(pricingData.content_type) : [], [pricingData]);
  const models = useMemo(() => {
    if (!pricingData?.content_type?.[activeCategory]) return [];
    let list = pricingData.content_type[activeCategory];
    if (search.trim()) list = list.filter((m: any) => m.model.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [pricingData, activeCategory, search]);

  const stats = useMemo(() => {
    const flatPrices = models.filter((m: any) => typeof m.billing.value === "number").map((m: any) => m.billing.value);
    if (!flatPrices.length) return null;
    return { count: models.length, min: Math.min(...flatPrices), max: Math.max(...flatPrices), avg: flatPrices.reduce((a: number, b: number) => a + b, 0) / flatPrices.length };
  }, [models]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16" />)}</div>;

  return (
    <div>
      <div className="page-header"><h1>Model Pricing</h1><p>Complete pricing overview across all content types</p></div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {categories.map((cat) => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setSearch(""); }}
            className={`btn btn-sm ${activeCategory === cat ? "btn-primary" : "btn-secondary"}`}>
            {CATEGORY_LABELS[cat] || cat} <span className="text-[10px] opacity-60 ml-1">({pricingData?.content_type?.[cat]?.length ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-md mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models..." className="input pl-9" />
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="stat-card text-center"><p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Models</p><p className="text-lg font-bold mt-1">{stats.count}</p></div>
          <div className="stat-card text-center"><p className="text-[10px] text-emerald-400 uppercase tracking-widest">Cheapest</p><p className="text-lg font-bold mt-1 text-emerald-400">${stats.min.toFixed(3)}</p></div>
          <div className="stat-card text-center"><p className="text-[10px] text-red-400 uppercase tracking-widest">Most Expensive</p><p className="text-lg font-bold mt-1 text-red-400">${stats.max.toFixed(3)}</p></div>
          <div className="stat-card text-center"><p className="text-[10px] text-[var(--accent-light)] uppercase tracking-widest">Average</p><p className="text-lg font-bold mt-1 text-[var(--accent-light)]">${stats.avg.toFixed(3)}</p></div>
        </div>
      )}

      {models.length === 0 ? (
        <div className="glass p-8 text-center text-[var(--muted)]">No models found.</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>Model</th><th>Billing Type</th><th>Provider Cost</th><th>Marked-up (5x)</th><th>App Credits</th><th>API Credits</th></tr></thead>
            <tbody>
              {models.map((m: any, idx: number) => {
                const isFlat = typeof m.billing.value === 'number';
                const markedUp = isFlat ? m.billing.value * 5 : null;
                return (
                <tr key={idx}>
                  <td className="font-medium">{m.model}</td>
                  <td><span className="badge badge-muted">{m.billing.type.replace(/_/g, " ")}</span></td>
                  <td className="font-mono text-amber-400">{formatBilling(m.billing)}</td>
                  <td className="font-mono text-orange-300">{markedUp !== null ? `$${markedUp.toFixed(3)}` : "Variable"}</td>
                  <td className="font-mono text-emerald-400">{markedUp !== null ? (markedUp * 20).toFixed(2) : "Variable"}</td>
                  <td className="font-mono text-[var(--accent-light)]">{markedUp !== null ? (markedUp * 10).toFixed(2) : "Variable"}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
