"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";

function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;
  return (
    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
      {provider}
    </span>
  );
}

export default function ModelList({ items }: { items: any }) {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return Array.isArray(items) ? items : typeof items === "object" && items ? Object.values(items) : [];
  }, [items]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return list;
    return list.filter((m: any) => {
      const parts = [
        m?.name,
        m?.model,
        m?.title,
        m?.slug,
        m?.description,
        m?.summary,
        m?.details,
        m?.provider,
        m?.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return parts.includes(q);
    });
  }, [list, query]);

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Clipboard error', e);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models by name, slug, provider, or description..."
          className="flex-1 rounded border px-3 py-2 text-sm bg-white dark:bg-gray-900"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600">No models match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m: any, idx: number) => {
        const key = m?.slug || m?.id || m?.model || idx;
        const title = m?.name || m?.model || m?.title || m?.slug || 'Untitled';
        const provider = m?.provider || m?.source || undefined;
        const desc = m?.description || m?.summary || m?.details || '';
        const slug = m?.slug || '';
        const thumbnail = m?.thumbnail || m?.image || m?.logo || null;

        return (
          <article key={key} className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="flex">
              <div className="w-24 h-24 shrink-0 bg-gray-50 flex items-center justify-center">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-sm text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <div className="mt-1">
                      <ProviderBadge provider={provider} />
                      {m?.type && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {m.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{desc}</p>
                <div className="mt-3 flex items-center gap-3">
                  {slug ? (
                    <Link href={`/models/${slug}`} className="text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">View</Link>
                  ) : (
                    <span className="text-sm text-gray-500">No slug</span>
                  )}
                  {slug && (
                    <button
                      onClick={() => copyToClipboard(slug)}
                      className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded border hover:bg-gray-200"
                    >
                      Copy slug
                    </button>
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
