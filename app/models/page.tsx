"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ModelList from "../components/ModelList";
import { getAuthHeaders } from "../lib/apiUtils";
import { getPricing } from "../lib/adminApi";

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [pricingData, setPricingData] = useState<any>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  useEffect(() => {
    getPricing()
      .then((res) => setPricingData(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiBase}/api/v1/ai-models/?page=${page}&page_size=${pageSize}`, {
          headers
        });
        const json = await res.json();
        setModels(json.data.models || []);
        setTotal(json.data?.total ?? 0);
        setTotalPages(json.data?.total_pages ?? 1);
        setPage(json.data?.page ?? page);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [apiBase, page, pageSize]);

  // Build pricing lookup map: model name -> billing config
  const pricingMap = useMemo(() => {
    if (!pricingData?.content_type) return {};
    const map: Record<string, any> = {};
    for (const category of Object.values(pricingData.content_type) as any[]) {
      if (!Array.isArray(category)) continue;
      for (const entry of category) {
        if (entry.model && entry.billing) {
          map[entry.model] = entry.billing;
        }
      }
    }
    return map;
  }, [pricingData]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">All AI Models</h1>
          <p className="text-sm text-gray-400 mt-1">{total} models total</p>
        </div>
        <div>
          <Link href="/models/new" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Create Model</Link>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Link href="/models/images" className="text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">Images</Link>
        <Link href="/models/videos" className="text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">Videos</Link>
        <Link href="/models/lipsync" className="text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">Lipsync</Link>
        <Link href="/providers" className="text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-white/10 transition-colors">Providers</Link>
        <Link href="/pricing" className="text-sm bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-700 transition-colors">View All Pricing</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-lg shadow-sm p-4 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <ModelList items={models} pricingMap={pricingMap} />

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-100">Showing {(models.length > 0 ? (page - 1) * pageSize + 1 : 0)}–{Math.min(page * pageSize, total)} of {total}</div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-100">Page size:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="text-sm border rounded px-2 py-1"
              >
                {[6,12,18,24,48].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-white border text-black rounded disabled:opacity-50"
              >Prev</button>

              <div className="text-sm">{page} / {totalPages}</div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 bg-white text-black border rounded disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
