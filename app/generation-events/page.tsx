"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listGenerationEvents, getGenerationTrace } from "../lib/adminApi";
import LogEntries from "../components/LogEntries";

interface GenEvent {
  id: string; kind: string; provider: string | null; provider_task_id: string | null; table_name: string | null; model: string | null;
  status: string | null; credits: number | null; user_id: string | null; request_id: string | null; turn_id: string | null; task_id: string | null;
  conversation_id: string | null; batch_id: string | null; error_code: string | null; error_message: string | null; details: Record<string, unknown> | null; occurred_at: string;
}
interface Trace { provider_task_id: string; events: GenEvent[]; request_ids: string[]; duration_ms: number | null }

const KINDS = ["dispatched", "callback", "updated", "failed", "refunded", "charged"];
function kindBadge(k: string) {
  const cls = k === "failed" ? "badge-danger" : k === "callback" ? "badge-accent" : k === "refunded" ? "badge-warning" : k === "dispatched" ? "badge-success" : "badge-muted";
  return <span className={`badge ${cls}`}>{k}</span>;
}

export default function GenerationEventsPage() {
  const [rows, setRows] = useState<GenEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [kind, setKind] = useState("");
  const [provider, setProvider] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [trace, setTrace] = useState<Trace | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);
      const res = await listGenerationEvents({ page, limit: 25, kind: kind || undefined, provider: provider || undefined, user_id: uuid ? search : undefined, provider_task_id: !uuid && search ? search : undefined });
      setRows(res.data.events); setTotal(res.data.total); setTotalPages(res.data.total_pages);
    } catch (e: any) { setError(e.message || "Failed to load generation events"); }
    finally { setLoading(false); }
  }, [page, kind, provider, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  async function openTrace(providerTaskId: string) {
    setTraceLoading(true);
    try { const res = await getGenerationTrace(providerTaskId); setTrace(res.data); }
    catch (e: any) { setError(e.message || "Failed to load trace"); }
    finally { setTraceLoading(false); }
  }

  return (
    <div>
      <div className="page-header"><h1>Generation Events</h1><p>{total.toLocaleString()} events. Dispatched, provider callback, updated or failed, and refunds, keyed by the provider&apos;s task id. Click a row for that generation start to finish.</p></div>

      <div className="flex flex-wrap gap-2 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); setTrace(null); }} className="flex gap-2 flex-1 min-w-[240px]">
          <input type="text" placeholder="provider task id, or a user uuid" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input" />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="btn btn-secondary btn-sm">Clear</button>}
        </form>
        <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All kinds</option>{KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input type="text" placeholder="provider (kie, fal, …)" value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }} className="input w-auto" />
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-red-500/20 text-sm text-red-400">{error}</div>}

      {(trace || traceLoading) && (
        <div className="glass p-4 mb-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-xs font-semibold">Trace · <span className="font-mono">{trace?.provider_task_id}</span></p>
              {trace && <p className="text-[10px] text-[var(--muted)]">{trace.events.length} events{trace.duration_ms !== null ? ` · ${Math.round(trace.duration_ms / 1000)}s first to last` : ""}</p>}
            </div>
            <div className="flex gap-2">
              {trace && <Link href={`/logs?provider_task_id=${encodeURIComponent(trace.provider_task_id)}&since=30d`} className="btn btn-secondary btn-sm">All log lines</Link>}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTrace(null)}>Close</button>
            </div>
          </div>
          {traceLoading ? <div className="skeleton h-24" /> : trace && (
            <>
              <ol className="space-y-2 mb-4">
                {trace.events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-[var(--muted)] whitespace-nowrap w-[150px]">{new Date(e.occurred_at).toLocaleString()}</span>
                    {kindBadge(e.kind)}
                    <span className="min-w-0">
                      {e.status && <span className="font-mono">{e.status}</span>}
                      {e.model && <span className="text-[var(--muted)]"> · {e.model}</span>}
                      {e.table_name && <span className="text-[var(--muted)]"> · {e.table_name}</span>}
                      {e.credits !== null && <span className={e.credits < 0 ? " text-red-400" : " text-emerald-400"}> · {e.credits > 0 ? "+" : ""}{e.credits} credits</span>}
                      {e.error_message && <div className="text-red-400">{e.error_code ? `${e.error_code}: ` : ""}{e.error_message}</div>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {e.request_id && <Link href={`/logs?request_id=${encodeURIComponent(e.request_id)}&since=30d`} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--accent-light)]">request {e.request_id.slice(0, 8)}</Link>}
                        {e.user_id && <Link href={`/users/${e.user_id}`} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--accent-light)]">user {e.user_id.slice(0, 8)}</Link>}
                        {e.turn_id && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted)]">turn {e.turn_id.slice(0, 8)}</span>}
                        {e.task_id && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted)]">task {e.task_id.slice(0, 8)}</span>}
                      </div>
                    </span>
                  </li>
                ))}
              </ol>
              <LogEntries filters={{ provider_task_id: trace.provider_task_id, since: "30d", limit: 200 }} title="Log lines for this generation" />
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>When</th><th>Kind</th><th>Provider</th><th>Task id</th><th>Model</th><th>Status</th><th>User</th><th className="text-right">Credits</th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-[var(--muted)]">No generation events match</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className={r.provider_task_id ? "cursor-pointer" : ""} onClick={() => r.provider_task_id && openTrace(r.provider_task_id)}>
                  <td className="whitespace-nowrap text-[var(--muted)]">{new Date(r.occurred_at).toLocaleString()}</td>
                  <td>{kindBadge(r.kind)}</td>
                  <td className="text-xs">{r.provider || "—"}</td>
                  <td className="font-mono text-[11px] truncate max-w-[180px]">{r.provider_task_id || "—"}</td>
                  <td className="text-xs truncate max-w-[160px]">{r.model || "—"}</td>
                  <td className="text-xs">{r.status || ""}{r.error_code && <span className="text-red-400"> {r.error_code}</span>}</td>
                  <td>{r.user_id ? <Link href={`/users/${r.user_id}`} className="text-[var(--accent-light)] hover:underline font-mono text-xs" onClick={(e) => e.stopPropagation()}>{r.user_id.slice(0, 8)}</Link> : <span className="text-[var(--muted)]">—</span>}</td>
                  <td className="text-right font-mono text-xs">{r.credits === null ? "" : r.credits > 0 ? <span className="text-emerald-400">+{r.credits}</span> : <span className="text-red-400">{r.credits}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination justify-between">
          <span className="text-xs text-[var(--muted)]">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
