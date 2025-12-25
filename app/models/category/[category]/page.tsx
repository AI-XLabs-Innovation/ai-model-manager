"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ModelList from "../../../components/ModelList";
import Link from "next/link";

export default function ModelsByCategoryPage() {
  const params = useParams() as { category?: string };
  const category = params?.category || '';
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  useEffect(() => {
    if (!category) return;
    const fetchModels = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/v1/ai-models/category/${encodeURIComponent(category)}`);
        const json = await res.json();
        setModels(json.data?.models || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [apiBase, category]);

  return (
    <div className="p-8">
      <div className="mb-4">
        <Link href="/models" className="text-sm text-gray-600 mr-4">← Back to All Models</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Category: {category}</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-lg shadow-sm p-4 animate-pulse" />
          ))}
        </div>
      ) : (
        <ModelList items={models} />
      )}
    </div>
  );
}
