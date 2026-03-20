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

  useEffect(() => { getPricing().then((res) => setPricingData(res.data)).catch(() => {}); }, []);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiBase}/api/v1/ai-models/?page=${page}&page_size=${pageSize}`, { headers });
        const json = await res.json();
        setModels(json.data.models || []);
        setTotal(json.data?.total ?? 0);
        setTotalPages(json.data?.total_pages ?? 1);
        setPage(json.data?.page ?? page);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchModels();
  }, [apiBase, page, pageSize]);

  const pricingMap = useMemo(() => {
    if (!pricingData?.content_type) return {};
    const map: Record<string, any> = {};
    for (const category of Object.values(pricingData.content_type) as any[]) {
      if (!Array.isArray(category)) continue;
      for (const entry of category) { if (entry.model && entry.billing) map[entry.model] = entry.billing; }
    }
    return map;
  }, [pricingData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>AI Models</h1>
          <p>{total.toLocaleString()} models in catalog</p>
        </div>
        <Link href="/models/new" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Model
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/models/images" className="btn btn-secondary btn-sm">Images</Link>
        <Link href="/models/videos" className="btn btn-secondary btn-sm">Videos</Link>
        <Link href="/models/lipsync" className="btn btn-secondary btn-sm">Lipsync</Link>
        <Link href="/providers" className="btn btn-secondary btn-sm">Providers</Link>
        <Link href="/pricing" className="btn btn-sm" style={{ background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.15)" }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1" /></svg>
          View All Pricing
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24" />)}
        </div>
      ) : (
        <>
          <ModelList items={models} pricingMap={pricingMap} />
          <div className="pagination justify-between">
            <span className="text-xs text-[var(--muted)]">
              {models.length > 0 ? (page - 1) * pageSize + 1 : 0}--{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-3">
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="input w-auto text-xs py-1.5">
                {[6, 12, 18, 24, 48].map(n => <option key={n} value={n}>{n} / page</option>)}
              </select>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                <span className="text-xs self-center text-[var(--muted)] px-1">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
