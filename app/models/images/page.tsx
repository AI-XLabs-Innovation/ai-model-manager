"use client";
import React, { useEffect, useState } from "react";
import ModelList from "../../components/ModelList";

export default function ImageModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/v1/ai-models/images`);
        const json = await res.json();
        setModels(json.data.models || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [apiBase]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Models</h1>
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
