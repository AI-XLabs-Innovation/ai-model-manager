"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { deleteModel } from "@/app/lib/aiModelsApi";


export default function ModelDetailPage() {
  const params = useParams() as { slug?: string };
  const slug = params?.slug || '';
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

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
        <Link href="/models" className="text-sm text-gray-100 mr-4">← Back to All Models</Link>
        <h2 className="text-xl font-semibold">Model not found</h2>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-4">
        <Link href="/models" className="text-sm text-gray-100 mr-4">← Back to All Models</Link>
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

            <div className="mt-4 flex items-center gap-3">
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
    </div>
  );
}
