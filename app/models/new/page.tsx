"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createModel } from '../../lib/aiModelsApi';

export default function NewModelPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>({ name: '', slug: '', provider: '', description: '', credits: 0, categories: '', version: '' });
  const [saving, setSaving] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, credits: Number(form.credits), version: form.version || undefined, categories: form.categories ? form.categories.split(',').map((c: string) => c.trim()) : [] };
      const res = await createModel(payload);
      const slug = res?.data?.model?.slug || res?.model?.slug || form.slug;
      router.push(slug ? `/models/${encodeURIComponent(slug)}` : '/models');
    } catch (err) { console.error(err); setSaving(false); }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/models" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Models
      </Link>

      <div className="page-header"><h1>Create New Model</h1></div>

      <form onSubmit={onSubmit} className="glass p-5 space-y-4">
        {[
          { label: "Name", name: "name" },
          { label: "Slug", name: "slug" },
          { label: "Provider", name: "provider" },
          { label: "Version", name: "version" },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">{f.label}</label>
            <input name={f.name} value={form[f.name]} onChange={onChange} className="input" />
          </div>
        ))}
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
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Creating...' : 'Create Model'}</button>
      </form>
    </div>
  );
}
