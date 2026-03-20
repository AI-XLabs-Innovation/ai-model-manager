"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { deleteModel } from "@/app/lib/aiModelsApi";
import { getPricing } from "@/app/lib/adminApi";
import { formatBilling } from "@/app/components/ModelList";

export default function ModelDetailPage() {
  const params = useParams() as { slug?: string };
  const slug = params?.slug || '';
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState<any>(null);
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  useEffect(() => { getPricing().then((res) => setPricingData(res.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${apiBase}/api/v1/ai-models/${encodeURIComponent(slug)}`)
      .then(r => r.json()).then(json => setModel(json.data?.model || null))
      .catch(console.error).finally(() => setLoading(false));
  }, [apiBase, slug]);

  const modelPricing = useMemo(() => {
    if (!pricingData?.content_type || !model) return null;
    const name = model.name || model.title || "";
    for (const category of Object.values(pricingData.content_type) as any[]) {
      if (!Array.isArray(category)) continue;
      for (const entry of category) { if (entry.model === name) return entry; }
    }
    return null;
  }, [pricingData, model]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20" />)}</div>;
  if (!model) return (
    <div>
      <Link href="/models" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>Back
      </Link>
      <div className="glass p-8 text-center mt-4 text-[var(--muted)]">Model not found</div>
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/models" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Models
        </Link>
        {model.provider && (
          <>
            <span className="text-[var(--muted)]">/</span>
            <Link href={`/models/provider/${encodeURIComponent(model.provider)}`} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{model.provider}</Link>
          </>
        )}
      </div>

      <div className="glass p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-xl bg-white/[0.03] flex items-center justify-center shrink-0 overflow-hidden">
            {model.thumbnail || model.image || model.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={model.thumbnail || model.image || model.logo} alt={model.name || model.slug} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517" /></svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{model.name || model.title || model.slug}</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{model.description || model.summary || 'No description available.'}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {model.provider && <span className="badge badge-accent">{model.provider}</span>}
              <span className="badge badge-muted">v{model.version ?? '--'}</span>
              <span className="badge badge-success">{model.credits ?? '--'} credits</span>
              {model.categories?.map((c: string) => <span key={c} className="badge badge-muted">{c}</span>)}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/models/${encodeURIComponent(slug)}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
            <button onClick={async () => {
              if (!confirm('Delete this model? (soft delete)')) return;
              try { await deleteModel(slug, true); router.push('/models'); } catch { alert('Failed to delete'); }
            }} className="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>
      </div>

      {/* Pricing */}
      {modelPricing && (
        <div className="glass p-5 mt-4">
          <h2 className="text-sm font-semibold mb-4">Pricing Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[var(--warning-bg)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--warning)]">Billing Type</p>
              <p className="text-sm font-semibold mt-1">{modelPricing.billing.type.replace(/_/g, ' ')}</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--warning-bg)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--warning)]">Provider Cost</p>
              <p className="text-sm font-semibold mt-1">{formatBilling(modelPricing.billing)}</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--success-bg)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--success)]">App Credits (5x&times;20)</p>
              <p className="text-sm font-semibold mt-1">{typeof modelPricing.billing.value === 'number' ? `${(modelPricing.billing.value * 5 * 20).toFixed(2)}` : 'Variable'}</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--accent-bg)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--accent-light)]">API Credits (5x&times;10)</p>
              <p className="text-sm font-semibold mt-1">{typeof modelPricing.billing.value === 'number' ? `${(modelPricing.billing.value * 5 * 10).toFixed(2)}` : 'Variable'}</p>
            </div>
          </div>
          {typeof modelPricing.billing.value === 'object' && (
            <div className="mt-3">
              <p className="text-xs font-medium text-[var(--muted)] mb-2">Tier Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(modelPricing.billing.value).map(([tier, price]) => (
                  <div key={tier} className="glass p-2 text-center">
                    <p className="text-[10px] text-[var(--muted)]">{tier}</p>
                    <p className="text-sm font-semibold">${String(price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
