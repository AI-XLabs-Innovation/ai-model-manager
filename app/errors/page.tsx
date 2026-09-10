"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listAppErrors, getAppError, resolveAppError } from "../lib/adminApi";
import LogEntries from "../components/LogEntries";

interface AppError {
  id: string; fingerprint: string; scope: string; name: string; message: string; last_message: string | null;
  frame: string | null; count: number; first_seen: string; last_seen: string; last_request_id: string | null;
  last_user_id: string | null; resolved_at: string | null; sample_stack?: string | null; last_context?: Record<string, unknown> | null;
}

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.round(s)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export default function ErrorsPage() {
  const [rows, setRows] = useState<AppError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [openOnly, setOpenOnly] = useState(true);
  const [scope, setScope] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, AppError | "loading">>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await listAppErrors({ page, limit: 25, open: openOnly ? "1" : undefined, scope: scope || undefined, search: search || undefined });
      setRows(res.data.errors); setTotal(res.data.total); setTotalPages(res.data.total_pages);
    } catch (e: any) { setError(e.message || "Failed to load errors"); }
    finally { setLoading(false); }
  }, [page, openOnly, scope, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggle(id: string) {
    if (expanded[id]) { setExpanded((m) => { const n = { ...m }; delete n[id]; return n; }); return; }
    setExpanded((m) => ({ ...m, [id]: "loading" }));
    try { const res = await getAppError(id); setExpanded((m) => ({ ...m, [id]: res.data })); }
    catch { setExpanded((m) => { const n = { ...m }; delete n[id]; return n; }); }
  }
  async function resolve(id: string) {
    try { await resolveAppError(id); await fetchData(); } catch (e: any) { setError(e.message || "Failed to resolve"); }
  }

  return (
    <div>
      <div className="page-header"><h1>Errors</h1><p>{total.toLocaleString()} distinct errors{openOnly ? " open" : ""}. One row per fingerprint (scope + error class + message shape + throw site); the count is how often it fired.</p></div>

      <div className="flex flex-wrap gap-2 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput); }} className="flex gap-2 flex-1 min-w-[240px]">
          <input type="text" placeholder="Search message / class…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input" />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="btn btn-secondary btn-sm">Clear</button>}
        </form>
        <input type="text" placeholder="scope (dodo, http, …)" value={scope} onChange={(e) => { setScope(e.target.value); setPage(1); }} className="input w-auto" />
        <label className="flex items-center gap-2 text-xs text-[var(--muted)] px-2"><input type="checkbox" checked={openOnly} onChange={(e) => { setOpenOnly(e.target.checked); setPage(1); }} /> open only</label>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-red-500/20 text-sm text-red-400">{error}</div>}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>Scope</th><th>Error</th><th className="text-right">Count</th><th>Last seen</th><th>First seen</th><th>Where</th><th></th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-[var(--muted)]">No errors{openOnly ? " open" : ""}. Good.</td></tr>
              ) : rows.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className="cursor-pointer" onClick={() => toggle(r.id)}>
                    <td><span className="badge badge-muted">{r.scope}</span></td>
                    <td className="max-w-[420px]"><div className="font-medium truncate">{r.name}: {r.last_message || r.message}</div><div className="text-[10px] font-mono text-[var(--muted)] truncate">{r.fingerprint}</div></td>
                    <td className="text-right font-mono">{r.count.toLocaleString()}</td>
                    <td className="whitespace-nowrap text-[var(--muted)]">{ago(r.last_seen)}</td>
                    <td className="whitespace-nowrap text-[var(--muted)]">{new Date(r.first_seen).toLocaleDateString()}</td>
                    <td className="font-mono text-[11px] text-[var(--muted)] truncate max-w-[220px]">{r.frame || "—"}</td>
                    <td>{r.resolved_at ? <span className="badge badge-success">resolved</span> : <button type="button" className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); resolve(r.id); }}>Resolve</button>}</td>
                  </tr>
                  {expanded[r.id] && (
                    <tr><td colSpan={7} className="!p-0">
                      <div className="p-4 bg-white/[0.02] space-y-3">
                        {expanded[r.id] === "loading" ? <div className="skeleton h-20" /> : (() => {
                          const d = expanded[r.id] as AppError;
                          return (
                            <>
                              <div className="flex flex-wrap gap-2 text-xs">
                                {d.last_request_id && <Link href={`/logs?request_id=${encodeURIComponent(d.last_request_id)}&since=30d`} className="btn btn-secondary btn-sm">Logs of last occurrence</Link>}
                                <Link href={`/logs?fingerprint=${encodeURIComponent(d.fingerprint)}&since=30d`} className="btn btn-secondary btn-sm">All occurrences in logs</Link>
                                {d.last_user_id && <Link href={`/users/${d.last_user_id}`} className="btn btn-secondary btn-sm">Last user</Link>}
                              </div>
                              {d.sample_stack && <pre className="text-[11px] font-mono text-[var(--muted)] whitespace-pre-wrap break-all max-h-64 overflow-auto glass p-3">{d.sample_stack}</pre>}
                              {d.last_context && <pre className="text-[11px] font-mono text-[var(--muted)] whitespace-pre-wrap break-all max-h-40 overflow-auto glass p-3">{JSON.stringify(d.last_context, null, 2)}</pre>}
                              <LogEntries filters={{ fingerprint: d.fingerprint, since: "30d", limit: 50 }} title="Recent occurrences" autoLoad={false} />
                            </>
                          );
                        })()}
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
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
