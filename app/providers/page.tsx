"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/v1/ai-models/providers`);
        const json = await res.json();
        setProviders(json.data?.providers || json.providers || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [apiBase]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Providers</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-lg shadow-sm p-4 animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          {(!providers || (Array.isArray(providers) && providers.length === 0) || (typeof providers === 'object' && Object.keys(providers).length === 0)) ? (
            <p className="text-gray-600">No providers found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(providers) ? providers : Object.keys(providers)).map((p: any) => {
                const name = typeof p === 'string' ? p : String(p);
                return (
                  <Link key={name} href={`/models/provider/${encodeURIComponent(name)}`} className="group">
                    <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition">
                      <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded">
                        <div className="text-sm text-gray-400">{name.charAt(0).toUpperCase()}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{name}</div>
                        <div className="text-sm text-gray-500">Provider</div>
                      </div>
                      <div>
                        <span className="text-sm text-blue-600 group-hover:underline">View models →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
