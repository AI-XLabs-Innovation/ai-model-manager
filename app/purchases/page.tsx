"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listPurchases, getPurchaseStats } from "../lib/adminApi";

interface Transaction {
  id: string;
  user_id: string;
  transaction_id: string;
  revenuecat_app_user_id: string | null;
  package_type: string;
  credits_added: number;
  status: string;
  environment: string;
  purchased_at: string | null;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
}

interface Stats {
  all_time: { transactions: number; credits_sold: number };
  last_30_days: { transactions: number; credits_sold: number };
  last_7_days: { transactions: number; credits_sold: number };
  by_package: Record<string, { count: number; credits: number }>;
  by_environment: { production: number; sandbox: number };
}

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400 bg-green-900/30",
  pending: "text-yellow-400 bg-yellow-900/30",
  failed: "text-red-400 bg-red-900/30",
  refunded: "text-gray-400 bg-gray-800",
};

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
    setLoading(true);
    setError(null);
    try {
      const [txRes, statsRes] = await Promise.all([
        listPurchases({
          page,
          limit,
          status: statusFilter || undefined,
          environment: envFilter || undefined,
          search: search || undefined,
        }),
        page === 1 ? getPurchaseStats() : Promise.resolve(null),
      ]);
      setTransactions(txRes.data.transactions);
      setTotal(txRes.data.total);
      setTotalPages(txRes.data.total_pages);
      if (statsRes) setStats(statsRes.data);
    } catch (e: any) {
      setError(e.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, envFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Purchases & Credits</h1>
        <span className="text-sm text-gray-400">{total} total transactions</span>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="All-time Transactions" value={stats.all_time.transactions} />
          <StatCard label="All-time Credits Sold" value={stats.all_time.credits_sold} accent />
          <StatCard label="Last 30 Days (credits)" value={stats.last_30_days.credits_sold} />
          <StatCard label="Last 7 Days (credits)" value={stats.last_7_days.credits_sold} />
        </div>
      )}

      {/* Package breakdown */}
      {stats && Object.keys(stats.by_package).length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">By Package</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.by_package).map(([pkg, { count, credits }]) => (
              <div key={pkg} className="px-4 py-2 rounded border border-white/10 bg-white/5 text-sm">
                <span className="font-semibold">{pkg}</span>
                <span className="text-gray-400 ml-2">{count}× · {credits.toLocaleString()} credits</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search transaction/RC ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 border rounded px-3 py-1.5 text-sm bg-transparent"
          />
          <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
              className="px-3 py-1.5 border rounded text-sm"
            >
              ×
            </button>
          )}
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1.5 text-sm bg-transparent"
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={envFilter}
          onChange={(e) => { setEnvFilter(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1.5 text-sm bg-transparent"
        >
          <option value="">All environments</option>
          <option value="PRODUCTION">Production</option>
          <option value="SANDBOX">Sandbox</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium text-right">Credits</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Env</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-xs">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2">
                      {t.profiles ? (
                        <Link href={`/users/${t.user_id}`} className="text-blue-500 hover:underline">
                          {t.profiles.full_name || t.profiles.email}
                        </Link>
                      ) : (
                        <span className="text-gray-500 font-mono text-xs">{t.user_id?.slice(0, 8)}…</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{t.package_type}</td>
                    <td className="px-4 py-2 text-right font-mono text-green-400">+{t.credits_added}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[t.status] || "text-gray-400 bg-gray-800"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{t.environment}</td>
                    <td className="px-4 py-2 text-gray-400 whitespace-nowrap">
                      {new Date(t.purchased_at || t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[140px]">
                      {t.transaction_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="p-4 rounded border border-white/10 bg-white/5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-blue-400" : ""}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
