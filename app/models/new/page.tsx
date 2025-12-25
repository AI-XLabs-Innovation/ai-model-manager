"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createModel } from '../../lib/aiModelsApi';

export default function NewModelPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({ name: '', slug: '', provider: '', description: '', credits: 0, categories: '', version: '' });
  const [saving, setSaving] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, credits: Number(form.credits), version: form.version || undefined, categories: form.categories ? form.categories.split(',').map((c: string) => c.trim()) : [] };
      const res = await createModel(payload);
      const slug = res?.data?.model?.slug || res?.model?.slug || form.slug;
      router.push(slug ? `/models/${encodeURIComponent(slug)}` : '/models');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create New AI Model</h1>
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
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Creating...' : 'Create Model'}</button>
        </div>
      </form>
    </div>
  );
}
