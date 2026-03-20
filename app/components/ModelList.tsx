"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";

function formatBilling(billing: any): string {
  if (!billing) return "";
  const { type, value } = billing;
  if (type === "flat") return `$${value}`;
  if (type === "per_megapixel") return `$${value}/MP`;
  if (type === "per_second") return `$${value}/sec`;
  if (type === "per_minute") return `$${value}/min`;
  if (type === "per_image") return `$${value}/img`;
  if (type === "per_5s") return `$${value}/5s`;
  if (type === "per_video") return `$${value}/video`;
  if (type === "base_5s") return `$${value}/5s`;
  if (type === "tiered" && typeof value === "object") {
    const prices = Object.values(value) as number[];
    return `$${Math.min(...prices)} - $${Math.max(...prices)}`;
  }
  if ((type === "resolution_based" || type === "resolution_flat") && typeof value === "object") {
    const prices = Object.values(value) as number[];
    return `$${Math.min(...prices)} - $${Math.max(...prices)}`;
  }
  if (type === "resolution_based_per_second" && typeof value === "object") {
    const prices = Object.values(value) as number[];
    return `$${Math.min(...prices)} - $${Math.max(...prices)}/sec`;
  }
  if (type === "base_plus_per_second" && typeof value === "object") {
    return `$${value.base_5s} base`;
  }
  if ((type === "audio_based" || type === "audio_based_per_second") && typeof value === "object") {
    return `$${value.audio_off} - $${value.audio_on}`;
  }
  return typeof value === "number" ? `$${value}` : "";
}

function PricingBadge({ pricing }: { pricing: any }) {
  if (!pricing) return null;
  const display = formatBilling(pricing);
  if (!display) return null;
  return <span className="badge badge-warning">{display}</span>;
}

export default function ModelList({
  items,
  pricingMap,
}: {
  items: any;
  pricingMap?: Record<string, any>;
}) {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return Array.isArray(items) ? items : typeof items === "object" && items ? Object.values(items) : [];
  }, [items]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return list;
    return list.filter((m: any) => {
      const parts = [m?.name, m?.model, m?.title, m?.slug, m?.description, m?.summary, m?.details, m?.provider, m?.source]
        .filter(Boolean).join(" ").toLowerCase();
      return parts.includes(q);
    });
  }, [list, query]);

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const getPricing = (model: any) => {
    if (!pricingMap) return null;
    return pricingMap[model?.name || model?.title || ""] || null;
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search models by name, slug, provider..."
            className="input pl-9"
          />
        </div>
        {query && (
          <button onClick={() => setQuery("")} className="btn btn-secondary btn-sm">Clear</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-8 text-center text-[var(--muted)]">No models match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((m: any, idx: number) => {
            const key = m?.slug || m?.id || m?.model || idx;
            const title = m?.name || m?.model || m?.title || m?.slug || "Untitled";
            const provider = m?.provider || m?.source || undefined;
            const desc = m?.description || m?.summary || m?.details || "";
            const slug = m?.slug || "";
            const thumbnail = m?.thumbnail || m?.image || m?.logo || null;
            const pricing = getPricing(m);
            const credits = m?.credits;

            return (
              <article key={key} className="glass glass-hover group transition-all overflow-hidden">
                <div className="flex">
                  <div className="w-20 h-20 shrink-0 bg-white/[0.02] flex items-center justify-center">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{title}</h3>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {provider && <span className="badge badge-accent">{provider}</span>}
                      {m?.type && <span className="badge badge-success">{m.type}</span>}
                      <PricingBadge pricing={pricing} />
                      {credits != null && credits > 0 && (
                        <span className="badge badge-muted">{credits} cr</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-[var(--muted)] line-clamp-1">{desc}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {slug ? (
                        <Link href={`/models/${slug}`} className="btn btn-primary btn-sm">View</Link>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">No slug</span>
                      )}
                      {slug && (
                        <button onClick={() => copyToClipboard(slug)} className="btn btn-secondary btn-sm">Copy slug</button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { formatBilling, PricingBadge };
