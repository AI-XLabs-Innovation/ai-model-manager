"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getModel, updateModel } from '../../../lib/aiModelsApi';

export default function EditModelPage() {
  const params = useParams() as { slug?: string };
  const slug = params?.slug || '';
  const router = useRouter();
  const [form, setForm] = useState<any>({ name: '', slug: '', provider: '', description: '', credits: 0, categories: '', version: '', released_at: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rankingForm, setRankingForm] = useState<any>({ rank: '', score: '', ranking_type: 'quality', content_type: '', category: '', is_latest: true });
  const [savingRanking, setSavingRanking] = useState(false);
  const [modelId, setModelId] = useState('');

  const isoToLocalDatetime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getModel(slug).then((res) => {
      const data = res?.data?.model || res?.model || null;
      if (data) {
        setModelId(data.id || '');
        setForm({
          name: data.name || data.title || '', slug: data.slug || '', provider: data.provider || '',
          description: data.description || data.summary || '', credits: data.credits ?? 0,
          version: data.version ?? '', released_at: data.released_at ? isoToLocalDatetime(data.released_at) : '',
          categories: Array.isArray(data.categories) ? data.categories.join(', ') : (data.categories || ''),
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));
  const onRankingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setRankingForm((f: any) => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, credits: Number(form.credits), version: form.version || undefined, categories: form.categories ? form.categories.split(',').map((c: string) => c.trim()) : [], released_at: form.released_at ? new Date(form.released_at).toISOString() : null };
      await updateModel(slug, payload);
      router.push(`/models/${encodeURIComponent(payload.slug || slug)}`);
    } catch (err) { console.error(err); setSaving(false); }
  };

  const onRankingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelId) { alert('Model ID not found'); return; }
    setSavingRanking(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/v1/ai-models/rankings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId, rank: Number(rankingForm.rank), score: Number(rankingForm.score), ranking_type: rankingForm.ranking_type, content_type: rankingForm.content_type || null, category: rankingForm.category || null, is_latest: rankingForm.is_latest }),
      });
      const result = await response.json();
      if (result.success) { alert('Ranking created!'); setRankingForm({ rank: '', score: '', ranking_type: 'quality', content_type: '', category: '', is_latest: true }); }
      else alert('Failed: ' + (result.error || 'Unknown'));
    } catch { alert('Error creating ranking'); }
    finally { setSavingRanking(false); }
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>;

  return (
    <div className="max-w-2xl">
      <Link href={`/models/${encodeURIComponent(slug)}`} className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Model
      </Link>

      <div className="page-header"><h1>Edit Model</h1></div>

      <form onSubmit={onSubmit} className="glass p-5 space-y-4 mb-6">
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Slug", name: "slug", type: "text" },
          { label: "Provider", name: "provider", type: "text" },
          { label: "Version", name: "version", type: "text" },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">{f.label}</label>
            <input name={f.name} type={f.type} value={form[f.name]} onChange={onChange} className="input" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Release Date</label>
          <input name="released_at" type="datetime-local" value={form.released_at || ''} onChange={onChange} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Credits</label>
          <input name="credits" type="number" value={form.credits} onChange={onChange} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Categories (comma separated)</label>
          <input name="categories" value={form.categories} onChange={onChange} className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} className="input" rows={4} style={{ resize: "vertical" }} />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>

      <div className="glass p-5">
        <h2 className="text-sm font-semibold mb-4">Create Model Ranking</h2>
        <form onSubmit={onRankingSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Rank (1 = best)</label>
              <input name="rank" type="number" min="1" value={rankingForm.rank} onChange={onRankingChange} className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Score (0-100)</label>
              <input name="score" type="number" step="0.001" min="0" value={rankingForm.score} onChange={onRankingChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Ranking Type</label>
            <select name="ranking_type" value={rankingForm.ranking_type} onChange={onRankingChange} className="input" required>
              <option value="quality">Quality</option>
              <option value="popularity">Popularity</option>
              <option value="latency">Latency</option>
              <option value="editor_pick">Editor Pick</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Content Type (optional)</label>
              <input name="content_type" value={rankingForm.content_type} onChange={onRankingChange} placeholder="e.g., image, video" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Category (optional)</label>
              <input name="category" value={rankingForm.category} onChange={onRankingChange} placeholder="e.g., text-to-image" className="input" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input name="is_latest" type="checkbox" checked={rankingForm.is_latest} onChange={onRankingChange} className="rounded" />
            Is Latest Ranking
          </label>
          <button type="submit" disabled={savingRanking} className="btn btn-primary">{savingRanking ? 'Creating...' : 'Create Ranking'}</button>
        </form>
      </div>
    </div>
  );
}
