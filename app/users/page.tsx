"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listUsers } from "../lib/adminApi";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  credits: number;
  created_at: string;
  revenuecat_app_user_id: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsers({ page, limit, search: search || undefined });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Users</h1>
          <p>{total.toLocaleString()} registered users</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by email or name..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input pl-9" />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        {search && (
          <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }} className="btn btn-secondary">Clear</button>
        )}
      </form>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--danger-bg)] border border-red-500/20 text-sm text-red-400">{error}</div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className="text-right">Credits</th>
                <th>RevenueCat ID</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[var(--muted)]">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.full_name || <span className="text-[var(--muted)]">--</span>}</td>
                    <td className="text-[var(--muted-foreground)]">{u.email}</td>
                    <td className="text-right font-mono">
                      <span className={u.credits <= 0 ? "text-red-400" : "text-emerald-400"}>{u.credits ?? 0}</span>
                    </td>
                    <td className="text-[var(--muted)] text-xs font-mono truncate max-w-[140px]">{u.revenuecat_app_user_id || "--"}</td>
                    <td className="text-[var(--muted)]">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      <Link href={`/users/${u.id}`} className="btn btn-secondary btn-sm">View</Link>
                    </td>
                  </tr>
                ))
              )}
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
