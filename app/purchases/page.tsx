"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listPurchases, getPurchaseStats } from "../lib/adminApi";

interface Transaction {
  id: string; user_id: string; transaction_id: string; revenuecat_app_user_id: string | null;
  package_type: string; credits_added: number; status: string; environment: string;
  purchased_at: string | null; created_at: string;
  profiles: { email: string; full_name: string | null } | null;
}
interface Stats {
  all_time: { transactions: number; credits_sold: number };
  last_30_days: { transactions: number; credits_sold: number };
  last_7_days: { transactions: number; credits_sold: number };
  by_package: Record<string, { count: number; credits: number }>;
  by_environment: { production: number; sandbox: number };
}

export default function PurchasesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [envFilter, setEnvFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [txRes, statsRes] = await Promise.all([
        listPurchases({ page, limit, status: statusFilter || undefined, environment: envFilter || undefined, search: search || undefined }),
        page === 1 ? getPurchaseStats() : Promise.resolve(null),
      ]);
      setTransactions(txRes.data.transactions); setTotal(txRes.data.total); setTotalPages(txRes.data.total_pages);
      if (statsRes) setStats(statsRes.data);
    } catch (e: any) { setError(e.message || "Failed to load purchases"); }
    finally { setLoading(false); }
  }, [page, limit, statusFilter, envFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); setPage(1); setSearch(searchInput); }

  return (
    <div>
      <div className="page-header"><h1>Purchases & Revenue</h1><p>{total.toLocaleString()} total transactions</p></div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="stat-card"><p className="text-[11px] text-[var(--muted)]">All-time Transactions</p><p className="text-xl font-bold mt-1">{stats.all_time.transactions.toLocaleString()}</p></div>
          <div className="stat-card glow"><p className="text-[11px] text-[var(--muted)]">All-time Credits Sold</p><p className="text-xl font-bold mt-1 gradient-text">{stats.all_time.credits_sold.toLocaleString()}</p></div>
          <div className="stat-card"><p className="text-[11px] text-[var(--muted)]">Last 30 Days</p><p className="text-xl font-bold mt-1">{stats.last_30_days.credits_sold.toLocaleString()}</p></div>
          <div className="stat-card"><p className="text-[11px] text-[var(--muted)]">Last 7 Days</p><p className="text-xl font-bold mt-1">{stats.last_7_days.credits_sold.toLocaleString()}</p></div>
        </div>
      )}

      {stats && Object.keys(stats.by_package).length > 0 && (
        <div className="mb-6">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">By Package</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.by_package).map(([pkg, { count, credits }]) => (
              <div key={pkg} className="glass px-3 py-2 text-xs">
                <span className="font-medium">{pkg}</span>
                <span className="text-[var(--muted)] ml-2">{count}x &middot; {credits.toLocaleString()} credits</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search transaction/RC ID..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input pl-9" />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
          {search && <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="btn btn-secondary btn-sm">Clear</button>}
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={envFilter} onChange={(e) => { setEnvFilter(e.target.value); setPage(1); }} className="input w-auto">
          <option value="">All environments</option>
          <option value="PRODUCTION">Production</option>
          <option value="SANDBOX">Sandbox</option>
        </select>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-red-500/20 text-sm text-red-400">{error}</div>}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>User</th><th>Package</th><th className="text-right">Credits</th><th>Status</th><th>Env</th><th>Date</th><th>Transaction ID</th></tr></thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-[var(--muted)]">No transactions found</td></tr>
              ) : transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.profiles ? <Link href={`/users/${t.user_id}`} className="text-[var(--accent-light)] hover:underline">{t.profiles.full_name || t.profiles.email}</Link> : <span className="text-[var(--muted)] font-mono text-xs">{t.user_id?.slice(0, 8)}</span>}</td>
                  <td className="font-medium">{t.package_type}</td>
                  <td className="text-right font-mono text-emerald-400">+{t.credits_added}</td>
                  <td><span className={`badge ${t.status === "completed" ? "badge-success" : t.status === "failed" ? "badge-danger" : t.status === "pending" ? "badge-warning" : "badge-muted"}`}>{t.status}</span></td>
                  <td><span className={`badge ${t.environment === "PRODUCTION" ? "badge-accent" : "badge-muted"}`}>{t.environment === "PRODUCTION" ? "Prod" : "Sandbox"}</span></td>
                  <td className="text-[var(--muted)] whitespace-nowrap">{new Date(t.purchased_at || t.created_at).toLocaleDateString()}</td>
                  <td className="font-mono text-xs text-[var(--muted)] truncate max-w-[120px]">{t.transaction_id}</td>
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
