"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LogEntries from "../components/LogEntries";
import type { LogFilters } from "../lib/adminApi";

const FIELDS: Array<{ key: keyof LogFilters; label: string; placeholder: string }> = [
  { key: "request_id", label: "Request id", placeholder: "x-request-id of one request" },
  { key: "user_id", label: "User id", placeholder: "profile uuid" },
  { key: "provider_task_id", label: "Provider task id", placeholder: "KIE taskId / fal request_id / …" },
  { key: "fingerprint", label: "Error fingerprint", placeholder: "from the Errors page or a 500's error_id" },
  { key: "turn_id", label: "Turn id", placeholder: "chat turn" },
  { key: "task_id", label: "Task id", placeholder: "background task" },
  { key: "conversation_id", label: "Conversation id", placeholder: "" },
  { key: "job", label: "Job", placeholder: "kie-reconciler, newsletter-sender, …" },
  { key: "scope", label: "Scope", placeholder: "dodo, http, slideshow, …" },
  { key: "search", label: "Contains", placeholder: "any substring of the line" },
];

function LogsInner() {
  const sp = useSearchParams();
  const initial: LogFilters = {};
  for (const f of FIELDS) { const v = sp.get(f.key as string); if (v) (initial as any)[f.key] = v; }
  initial.level = sp.get("level") || undefined;
  initial.since = sp.get("since") || "24h";
  const [draft, setDraft] = useState<LogFilters>(initial);
  const [applied, setApplied] = useState<LogFilters | null>(Object.keys(initial).some((k) => k !== "since" && k !== "level" && (initial as any)[k]) || initial.level ? initial : null);

  const set = (k: keyof LogFilters, v: string) => setDraft((d) => ({ ...d, [k]: v || undefined }));

  return (
    <div>
      <div className="page-header"><h1>Logs</h1><p>Every line the API wrote, from Loki. Pick at least one filter; ids come from the Errors, Payment Events and Generation Events pages, or from a 500 response&apos;s error_id.</p></div>

      <form onSubmit={(e) => { e.preventDefault(); setApplied({ ...draft }); }} className="glass p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FIELDS.map((f) => (
            <label key={f.key as string} className="block">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">{f.label}</span>
              <input className="input mt-1" value={(draft[f.key] as string) || ""} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />
            </label>
          ))}
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Level</span>
            <select className="input mt-1" value={draft.level || ""} onChange={(e) => set("level", e.target.value)}>
              <option value="">any</option><option value="error">error</option><option value="warn">warn</option><option value="info">info</option><option value="debug">debug</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Window</span>
            <select className="input mt-1" value={draft.since || "24h"} onChange={(e) => set("since", e.target.value)}>
              <option value="1h">last hour</option><option value="6h">last 6 hours</option><option value="24h">last 24 hours</option><option value="3d">last 3 days</option><option value="7d">last 7 days</option><option value="30d">last 30 days</option>
            </select>
          </label>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setDraft({ since: "24h" }); setApplied(null); }}>Clear</button>
        </div>
      </form>

      {applied ? <LogEntries key={JSON.stringify(applied)} filters={{ limit: 500, ...applied }} title="Results" /> : (
        <div className="glass p-8 text-center text-sm text-[var(--muted)]">Set a filter and search. Lines are newest first, up to 500; click a line for its full JSON.</div>
      )}
    </div>
  );
}

export default function LogsPage() {
  return <Suspense fallback={<div className="skeleton h-40" />}><LogsInner /></Suspense>;
}
