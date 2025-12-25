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

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getModel(slug).then((res) => {
      const data = res?.data?.model || res?.model || null;
      if (data) {
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
    </div>
  );
}
