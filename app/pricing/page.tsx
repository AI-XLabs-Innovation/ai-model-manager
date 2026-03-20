"use client";
import React, { useEffect, useState, useMemo } from "react";
import { getPricing } from "../lib/adminApi";
import { formatBilling } from "../components/ModelList";

const CATEGORY_LABELS: Record<string, string> = {
  image: "Image Generation",
  video: "Video Generation",
  audio: "Audio / TTS",
  lipsync: "Lipsync",
  image_upscale: "Image Upscale",
  video_upscale: "Video Upscale",
  background_removal: "Background Removal",
};

export default function PricingPage() {
  const [pricingData, setPricingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("image");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPricing()
      .then((res) => setPricingData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    if (!pricingData?.content_type) return [];
    return Object.keys(pricingData.content_type);
  }, [pricingData]);

  const models = useMemo(() => {
    if (!pricingData?.content_type?.[activeCategory]) return [];
    let list = pricingData.content_type[activeCategory];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m: any) => m.model.toLowerCase().includes(q));
    }
    return list;
  }, [pricingData, activeCategory, search]);

  const stats = useMemo(() => {
    if (!models.length) return null;
    const flatPrices = models
      .filter((m: any) => typeof m.billing.value === "number")
      .map((m: any) => m.billing.value);
    if (!flatPrices.length) return null;
    return {
      count: models.length,
      min: Math.min(...flatPrices),
      max: Math.max(...flatPrices),
      avg: flatPrices.reduce((a: number, b: number) => a + b, 0) / flatPrices.length,
    };
  }, [models]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-40 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Model Pricing</h1>
      <p className="text-sm text-gray-400 mb-6">Complete pricing overview for all AI models across content types</p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearch(""); }}
            className={`text-sm px-3 py-1.5 rounded border transition-colors ${
              activeCategory === cat
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            {CATEGORY_LABELS[cat] || cat} ({pricingData?.content_type?.[cat]?.length ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          className="w-full max-w-md rounded border px-3 py-2 text-sm bg-white/5 border-white/10"
        />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded border border-white/10 bg-white/5 text-center">
            <p className="text-xs text-gray-400">Models</p>
            <p className="text-lg font-bold">{stats.count}</p>
          </div>
          <div className="p-3 rounded border border-green-500/20 bg-green-500/5 text-center">
            <p className="text-xs text-green-400">Cheapest</p>
            <p className="text-lg font-bold text-green-400">${stats.min.toFixed(3)}</p>
          </div>
          <div className="p-3 rounded border border-red-500/20 bg-red-500/5 text-center">
            <p className="text-xs text-red-400">Most Expensive</p>
            <p className="text-lg font-bold text-red-400">${stats.max.toFixed(3)}</p>
          </div>
          <div className="p-3 rounded border border-blue-500/20 bg-blue-500/5 text-center">
            <p className="text-xs text-blue-400">Average</p>
            <p className="text-lg font-bold text-blue-400">${stats.avg.toFixed(3)}</p>
          </div>
        </div>
      )}

      {/* Pricing table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Model</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Billing Type</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Provider Cost</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">App Credits (20x)</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">API Credits (10x)</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m: any, idx: number) => {
              const isFlat = typeof m.billing.value === "number";
              return (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2 font-medium">{m.model}</td>
                  <td className="py-3 px-2">
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded">
                      {m.billing.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-amber-400 font-medium">{formatBilling(m.billing)}</td>
                  <td className="py-3 px-2 text-green-400">
                    {isFlat ? `${(m.billing.value * 20).toFixed(2)}` : "Variable"}
                  </td>
                  <td className="py-3 px-2 text-blue-400">
                    {isFlat ? `${(m.billing.value * 10).toFixed(2)}` : "Variable"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {models.length === 0 && (
        <p className="text-gray-400 text-center py-8">No models found in this category.</p>
      )}
    </div>
  );
}
