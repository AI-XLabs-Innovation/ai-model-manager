"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getModel, updateModel } from '../../../lib/aiModelsApi';

export default function EditModelPage() {
  const params = useParams() as { slug?: string };
  const slug = params?.slug || '';
  const router = useRouter();
  const [form, setForm] = useState<any>({ name: '', slug: '', provider: '', description: '', credits: 0, categories: '', version: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Convert ISO timestamp (UTC) to local `datetime-local` input value (YYYY-MM-DDTHH:mm)
  const isoToLocalDatetime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  // Model ranking state
  const [rankingForm, setRankingForm] = useState<any>({
    rank: '',
    score: '',
    ranking_type: 'quality',
    content_type: '',
    category: '',
    is_latest: true,
  });
  const [savingRanking, setSavingRanking] = useState(false);
  const [modelId, setModelId] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getModel(slug).then((res) => {
      const data = res?.data?.model || res?.model || null;
      if (data) {
        setModelId(data.id || '');
        setForm({
          name: data.name || data.title || '',
          slug: data.slug || '',
          provider: data.provider || '',
          description: data.description || data.summary || '',
          credits: data.credits ?? 0,
          version: data.version ?? '',
          released_at: data.released_at ? isoToLocalDatetime(data.released_at) : '',
          categories: Array.isArray(data.categories) ? data.categories.join(', ') : (data.categories || ''),
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };

  const onRankingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setRankingForm((f: any) => ({ ...f, [name]: finalValue }));
  };

  const onRankingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelId) {
      alert('Model ID not found');
      return;
    }
    setSavingRanking(true);
    try {
      const payload = {
        model_id: modelId,
        rank: Number(rankingForm.rank),
        score: Number(rankingForm.score),
        ranking_type: rankingForm.ranking_type,
        content_type: rankingForm.content_type || null,
        category: rankingForm.category || null,
        is_latest: rankingForm.is_latest,
      };
      const API_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/ai-models/rankings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        alert('Model ranking created successfully!');
        setRankingForm({ rank: '', score: '', ranking_type: 'quality', content_type: '', category: '', is_latest: true });
      } else {
        alert('Failed to create ranking: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error creating ranking');
    } finally {
      setSavingRanking(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, credits: Number(form.credits), version: form.version || undefined, categories: form.categories ? form.categories.split(',').map((c: string) => c.trim()) : [], released_at: form.released_at ? new Date(form.released_at).toISOString() : null };
      await updateModel(slug, payload);
      router.push(`/models/${encodeURIComponent(payload.slug || slug)}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit AI Model</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" value={form.name} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input name="slug" value={form.slug} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Provider</label>
          <input name="provider" value={form.provider} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Version</label>
          <input name="version" value={form.version} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Release Date</label>
          <input
            name="released_at"
            type="datetime-local"
            value={form.released_at || ''}
            onChange={onChange}
            className="mt-1 block w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Credits</label>
          <input name="credits" type="number" value={form.credits} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Categories (comma separated)</label>
          <input name="categories" value={form.categories} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} className="mt-1 block w-full border rounded px-2 py-1" rows={5} />
        </div>
        <div>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>

      {/* Model Ranking Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Create Model Ranking</h2>
        <form onSubmit={onRankingSubmit} className="space-y-4 max-w-xl border-t pt-4">
          <div>
            <label className="block text-sm font-medium">Rank (1 = best)</label>
            <input
              name="rank"
              type="number"
              min="1"
              value={rankingForm.rank}
              onChange={onRankingChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Score (0-100)</label>
            <input
              name="score"
              type="number"
              step="0.001"
              min="0"
              value={rankingForm.score}
              onChange={onRankingChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Ranking Type</label>
            <select
              name="ranking_type"
              value={rankingForm.ranking_type}
              onChange={onRankingChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              required
            >
              <option value="quality">Quality</option>
              <option value="popularity">Popularity</option>
              <option value="latency">Latency</option>
              <option value="editor_pick">Editor Pick</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Content Type (optional)</label>
            <input
              name="content_type"
              value={rankingForm.content_type}
              onChange={onRankingChange}
              placeholder="e.g., image, video, audio"
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category (optional)</label>
            <input
              name="category"
              value={rankingForm.category}
              onChange={onRankingChange}
              placeholder="e.g., text-to-image, image-to-video"
              className="mt-1 block w-full border rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center">
            <input
              name="is_latest"
              type="checkbox"
              checked={rankingForm.is_latest}
              onChange={onRankingChange}
              className="mr-2"
            />
            <label className="text-sm font-medium">Is Latest Ranking</label>
          </div>
          <div>
            <button
              type="submit"
              disabled={savingRanking}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {savingRanking ? 'Creating...' : 'Create Ranking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
