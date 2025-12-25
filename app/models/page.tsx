"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ModelList from "../components/ModelList";

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/v1/ai-models/?page=${page}&page_size=${pageSize}`);
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All AI Models</h1>
        <div>
          <Link href="/models/new" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Create Model</Link>
        </div>
      </div>
      <div className="mb-4">
        <Link href="/models/images" className="mr-4 text-blue-600">Images</Link>
        <Link href="/models/videos" className="mr-4 text-blue-600">Videos</Link>
        <Link href="/models/lipsync" className="mr-4 text-blue-600">Lipsync</Link>
        <Link href="/providers" className="text-blue-600">Providers</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-lg shadow-sm p-4 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <ModelList items={models} />

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
