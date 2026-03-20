"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  useEffect(() => {
    fetch(`${apiBase}/api/v1/ai-models/providers`).then(r => r.json())
      .then(json => setProviders(json.data?.providers || json.providers || []))
      .catch(console.error).finally(() => setLoading(false));
  }, [apiBase]);

  return (
    <div>
      <div className="page-header"><h1>Providers</h1><p>AI model providers powering the platform</p></div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : (!providers || (Array.isArray(providers) && providers.length === 0)) ? (
        <div className="glass p-8 text-center text-[var(--muted)]">No providers found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Array.isArray(providers) ? providers : Object.keys(providers)).map((p: any) => {
            const name = typeof p === 'string' ? p : String(p);
            return (
              <Link key={name} href={`/models/provider/${encodeURIComponent(name)}`} className="glass glass-hover p-4 flex items-center gap-4 group transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-[var(--accent-light)]">{name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-[11px] text-[var(--muted)]">AI Provider</p>
                </div>
                <svg className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent-light)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
