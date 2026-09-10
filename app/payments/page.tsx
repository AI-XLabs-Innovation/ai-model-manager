"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listPaymentEvents, getPaymentEvent } from "../lib/adminApi";
import LogEntries from "../components/LogEntries";

interface PaymentEvent {
  id: string; provider: string; source: string; event_id: string; event_type: string; store: string | null;
  environment: string | null; status: string | null; outcome: string; outcome_detail: string | null; user_id: string | null;
  external_user_id: string | null; customer_email: string | null; transaction_id: string | null; original_transaction_id: string | null;
  subscription_id: string | null; product_id: string | null; package_type: string | null; credits: number | null; amount: number | null;
  currency: string | null; error_code: string | null; error_message: string | null; signature_valid: boolean | null; http_status: number | null;
  processing_ms: number | null; occurred_at: string | null; received_at: string; deliveries: number; last_seen_at: string;
  payload?: unknown; headers?: Record<string, string> | null;
}

const OUTCOMES = ["granted", "duplicate", "revoked", "regranted", "pending", "unmapped", "ignored", "sandbox_no_grant", "subscription_updated", "rejected", "invalid", "failed", "error"];
const BAD = new Set(["error", "rejected", "unmapped", "failed", "invalid"]);

function outcomeBadge(o: string) {
  const cls = o === "granted" || o === "regranted" ? "badge-success" : BAD.has(o) ? "badge-danger" : o === "pending" || o === "revoked" ? "badge-warning" : "badge-muted";
  return <span className={`badge ${cls}`}>{o}</span>;
}

export default function PaymentEventsPage() {
  const [rows, setRows] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [provider, setProvider] = useState("");
  const [outcome, setOutcome] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, PaymentEvent | "loading">>({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const isEmail = search.includes("@");
      const res = await listPaymentEvents({
        page, limit: 25, provider: provider || undefined, outcome: outcome || undefined,
        email: isEmail ? search : undefined, transaction_id: !isEmail && search ? search : undefined,
      });
      setRows(res.data.events); setTotal(res.data.total); setTotalPages(res.data.total_pages);
    } catch (e: any) { setError(e.message || "Failed to load payment events"); }
    finally { setLoading(false); }
  }, [page, provider, outcome, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggle(id: string) {
    if (expanded[id]) { setExpanded((m) => { const n = { ...m }; delete n[id]; return n; }); return; }
    setExpanded((m) => ({ ...m, [id]: "loading" }));
    try { const res = await getPaymentEvent(id); setExpanded((m) => ({ ...m, [id]: res.data })); }
    catch { setExpanded((m) => { const n = { ...m }; delete n[id]; return n; }); }
  }

  return (
    <div>
      <div className="page-header"><h1>Payment Events</h1><p>{total.toLocaleString()} events. Every Dodo, RevenueCat (App Store / Play) webhook and app add-credits call, with what we did about it. Deliveries &gt; 1 means the provider retried the same event.</p></div>

      <div className="flex flex-wrap gap-2 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="flex gap-2 flex-1 min-w-[240px]">
          <input type="text" placeholder="transaction / subscription id, or an email" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input" />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="btn btn-secondary btn-sm">Clear</button>}
        </form>
        <select value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All providers</option><option value="dodo">Dodo (web)</option><option value="revenuecat">RevenueCat (app)</option>
        </select>
        <select value={outcome} onChange={(e) => { setOutcome(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All outcomes</option>{OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-red-500/20 text-sm text-red-400">{error}</div>}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>When</th><th>Provider</th><th>Event</th><th>Outcome</th><th>Who</th><th>Product</th><th className="text-right">Credits</th><th className="text-right">Amount</th><th>Transaction</th><th className="text-right">Deliv.</th></tr></thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-[var(--muted)]">No payment events match</td></tr>
              ) : rows.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className="cursor-pointer" onClick={() => toggle(r.id)}>
                    <td className="whitespace-nowrap text-[var(--muted)]">{new Date(r.received_at).toLocaleString()}</td>
                    <td><span className={`badge ${r.provider === "dodo" ? "badge-accent" : "badge-muted"}`}>{r.provider}{r.store && r.store !== "dodo" ? ` · ${r.store}` : ""}</span>{r.source === "client" && <span className="badge badge-muted ml-1">client</span>}</td>
                    <td className="font-mono text-xs">{r.event_type}</td>
                    <td>{outcomeBadge(r.outcome)}{r.error_code && <div className="text-[10px] text-red-400 mt-0.5">{r.error_code}</div>}</td>
                    <td className="max-w-[180px]">{r.user_id ? <Link href={`/users/${r.user_id}`} className="text-[var(--accent-light)] hover:underline text-xs">{r.customer_email || r.user_id.slice(0, 8)}</Link> : <span className="text-xs text-[var(--muted)] truncate block">{r.customer_email || r.external_user_id || "—"}</span>}</td>
                    <td className="text-xs">{r.package_type || r.product_id || "—"}</td>
                    <td className="text-right font-mono">{r.credits === null ? "" : r.credits > 0 ? <span className="text-emerald-400">+{r.credits}</span> : <span className="text-red-400">{r.credits}</span>}</td>
                    <td className="text-right font-mono text-xs">{r.amount !== null ? `${r.amount} ${r.currency || ""}` : ""}</td>
                    <td className="font-mono text-[11px] text-[var(--muted)] truncate max-w-[140px]">{r.transaction_id || r.subscription_id || "—"}</td>
                    <td className="text-right font-mono text-xs">{r.deliveries > 1 ? <span className="badge badge-warning">{r.deliveries}</span> : r.deliveries}</td>
                  </tr>
                  {expanded[r.id] && (
                    <tr><td colSpan={10} className="!p-0">
                      <div className="p-4 bg-white/[0.02] space-y-3">
                        {expanded[r.id] === "loading" ? <div className="skeleton h-20" /> : (() => {
                          const d = expanded[r.id] as PaymentEvent;
                          return (
                            <>
                              {(d.outcome_detail || d.error_message) && <p className="text-sm">{d.outcome_detail}{d.error_message ? <span className="text-red-400"> · {d.error_message}</span> : null}</p>}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                                {[["Event id", d.event_id], ["HTTP", d.http_status], ["Signature", d.signature_valid === null ? "—" : d.signature_valid ? "valid" : "INVALID"], ["Processing", d.processing_ms !== null ? `${d.processing_ms} ms` : "—"], ["Environment", d.environment], ["Status", d.status], ["External user", d.external_user_id], ["Occurred", d.occurred_at ? new Date(d.occurred_at).toLocaleString() : "—"]].map(([k, v]) => (
                                  <div key={String(k)} className="glass px-3 py-2"><p className="text-[10px] text-[var(--muted)]">{k}</p><p className="font-mono break-all">{String(v ?? "—")}</p></div>
                                ))}
                              </div>
                              <details><summary className="text-xs cursor-pointer text-[var(--muted)]">Provider payload</summary><pre className="text-[11px] font-mono text-[var(--muted)] whitespace-pre-wrap break-all max-h-80 overflow-auto glass p-3 mt-2">{JSON.stringify(d.payload, null, 2)}</pre></details>
                              <LogEntries filters={{ search: d.transaction_id || d.event_id, since: "30d", limit: 100 }} title="Log lines mentioning this payment" autoLoad={false} />
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
