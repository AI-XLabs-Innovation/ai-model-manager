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

  useEffect(() => {
    getPricing()
      .then((res) => setPricingData(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    const fetchModel = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/v1/ai-models/${encodeURIComponent(slug)}`);
        const json = await res.json();
        setModel(json.data?.model || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchModel();
  }, [apiBase, slug]);

  const modelPricing = useMemo(() => {
    if (!pricingData?.content_type || !model) return null;
    const name = model.name || model.title || "";
    for (const category of Object.values(pricingData.content_type) as any[]) {
      if (!Array.isArray(category)) continue;
      for (const entry of category) {
        if (entry.model === name) return entry;
      }
    }
    return null;
  }, [pricingData, model]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-40 bg-white rounded-lg shadow-sm p-4 animate-pulse" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="p-8">
        <Link href="/models" className="text-sm text-gray-100 mr-4">&larr; Back to All Models</Link>
        <h2 className="text-xl font-semibold">Model not found</h2>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-4">
        <Link href="/models" className="text-sm text-gray-100 mr-4">&larr; Back to All Models</Link>
        {model.provider && (
          <Link href={`/models/provider/${encodeURIComponent(model.provider)}`} className="text-sm text-gray-100">View provider</Link>
        )}
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-gray-50 flex items-center justify-center rounded overflow-hidden">
            {model.thumbnail || model.image || model.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={model.thumbnail || model.image || model.logo} alt={model.name || model.slug} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl text-gray-950 font-bold">{model.name || model.title || model.slug}</h1>
            <div className="mt-2 text-sm text-gray-600">Provider: {model.provider || 'unknown'}</div>
            <div className="mt-4 text-gray-700">
              {model.description || model.summary || 'No description available.'}
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">Credits: {model.credits ?? '—'}</span>
              <span className="inline-block bg-gray-50 text-gray-700 text-sm px-2 py-1 rounded">Version: {model.version ?? '—'}</span>
              {model.categories && Array.isArray(model.categories) && (
                <div className="flex gap-2 flex-wrap">
                  {model.categories.map((c: string) => (
                    <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{c}</span>
                  ))}
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Link href={`/models/${encodeURIComponent(slug)}/edit`} className="text-sm bg-white border px-3 py-1 rounded text-black">Edit</Link>
                <button
                  onClick={async () => {
                    if (!confirm('Delete this model? This is a soft delete by default.')) return;
                    try {
                      await deleteModel(slug, true);
                      router.push('/models');
                    } catch (e) {
                      console.error(e);
                      alert('Failed to delete model');
                    }
                  }}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded"
                >Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      {modelPricing && (
        <div className="mt-6 bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-600 font-medium">Billing Type</p>
              <p className="text-sm font-semibold text-amber-900 mt-1">{modelPricing.billing.type.replace(/_/g, ' ')}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-600 font-medium">Provider Cost</p>
              <p className="text-sm font-semibold text-amber-900 mt-1">{formatBilling(modelPricing.billing)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">App Credits (20x)</p>
              <p className="text-sm font-semibold text-green-900 mt-1">
                {typeof modelPricing.billing.value === 'number'
                  ? `${(modelPricing.billing.value * 20).toFixed(2)} credits`
                  : 'Variable'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">API Credits (10x)</p>
              <p className="text-sm font-semibold text-blue-900 mt-1">
                {typeof modelPricing.billing.value === 'number'
                  ? `${(modelPricing.billing.value * 10).toFixed(2)} credits`
                  : 'Variable'}
              </p>
            </div>
          </div>

          {typeof modelPricing.billing.value === 'object' && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Tier Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(modelPricing.billing.value).map(([tier, price]) => (
                  <div key={tier} className="p-2 bg-gray-50 rounded text-center">
                    <p className="text-xs text-gray-500">{tier}</p>
                    <p className="text-sm font-semibold text-gray-800">${String(price)}</p>
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
