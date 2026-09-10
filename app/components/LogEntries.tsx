"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { queryLogs, type LogFilters } from "../lib/adminApi";

export interface LogEntry {
  ts: string;
  nanos: string;
  labels: Record<string, string>;
  line: string;
  json: Record<string, unknown> | null;
}

/** Fields shown as chips under a line; everything else is in the expanded JSON. */
const CHIP_KEYS = ["scope", "requestId", "userId", "turnId", "taskId", "providerTaskId", "provider", "job", "route", "fingerprint", "step", "ms"] as const;

function levelBadge(level: string | undefined) {
  const l = (level || "").toLowerCase();
  const cls = l === "error" || l === "fatal" ? "badge-danger" : l === "warn" ? "badge-warning" : l === "info" ? "badge-success" : "badge-muted";
  return <span className={`badge ${cls}`}>{l || "text"}</span>;
}

function messageOf(e: LogEntry): string {
  if (e.json && typeof e.json.msg === "string") return e.json.msg;
  return e.line;
}

/** One log line: level, time, message, id chips, and the whole JSON on click. */
export function LogLine({ e }: { e: LogEntry }) {
  const [open, setOpen] = useState(false);
  const j = e.json || {};
  const level = (j.level as string) || e.labels.level || e.labels.detected_level;
  const err = j.err as { type?: string; message?: string; stack?: string } | undefined;
  return (
    <div className="border-b border-white/5 last:border-0">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full text-left px-3 py-2 hover:bg-white/[0.03] transition-colors">
        <div className="flex items-start gap-2">
          <span className="text-[11px] font-mono text-[var(--muted)] whitespace-nowrap pt-0.5">{new Date(e.ts).toLocaleTimeString()}</span>
          {levelBadge(level)}
          <span className="text-sm break-all">{messageOf(e)}</span>
        </div>
        {err?.message && <div className="mt-1 ml-[76px] text-xs text-red-400 break-all">{err.type ? `${err.type}: ` : ""}{err.message}</div>}
        <div className="mt-1 ml-[76px] flex flex-wrap gap-1">
          {CHIP_KEYS.filter((k) => j[k] !== undefined && j[k] !== null && j[k] !== "").map((k) => (
            <span key={k} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted)]">
              {k}=<span className="text-[var(--accent-light)]">{String(j[k])}</span>
            </span>
          ))}
        </div>
      </button>
      {open && (
        <pre className="px-3 pb-3 text-[11px] font-mono text-[var(--muted)] whitespace-pre-wrap break-all max-h-80 overflow-auto">
          {e.json ? JSON.stringify(e.json, null, 2) : e.line}
        </pre>
      )}
    </div>
  );
}

/**
 * Log lines for a set of filters, fetched through the API's Loki proxy.
 * Used by the Logs page and embedded under an error, a payment or a
 * generation to show "the lines for this one".
 */
export default function LogEntries({ filters, title, autoLoad = true }: { filters: LogFilters; title?: string; autoLoad?: boolean }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const key = JSON.stringify(filters);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await queryLogs({ limit: 300, since: "7d", ...filters });
      setEntries(res.data.entries); setQuery(res.data.query); setLoaded(true);
    } catch (e: any) { setError(e.message || "Failed to load logs"); }
    finally { setLoading(false); }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (autoLoad) load(); }, [autoLoad, load]);

  return (
    <div className="glass overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/5">
        <div className="min-w-0">
          {title && <p className="text-xs font-semibold">{title}</p>}
          {query && <p className="text-[10px] font-mono text-[var(--muted)] truncate">{query}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {loaded && <span className="text-[10px] text-[var(--muted)]">{entries.length} lines</span>}
          <button type="button" onClick={load} className="btn btn-secondary btn-sm" disabled={loading}>{loading ? "Loading…" : loaded ? "Refresh" : "Load logs"}</button>
          <Link href={`/logs${toQuery(filters)}`} className="btn btn-secondary btn-sm">Open in Logs</Link>
        </div>
      </div>
      {error && <div className="p-3 text-sm text-red-400">{error}</div>}
      {loading && !loaded && <div className="space-y-2 p-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-8" />)}</div>}
      {loaded && entries.length === 0 && !error && <div className="p-6 text-center text-sm text-[var(--muted)]">No lines in the window (7 days). Loki keeps 30 days; widen `since` on the Logs page.</div>}
      {entries.map((e) => <LogLine key={e.nanos + e.line.slice(0, 40)} e={e} />)}
    </div>
  );
}

export function toQuery(filters: LogFilters): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}
