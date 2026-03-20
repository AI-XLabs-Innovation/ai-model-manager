"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getDashboardStats, getSystemHealth } from "./lib/adminApi";

interface Stats {
  users: { total: number };
  purchases: { total: number; completed: number; credits_sold: number };
  generations: { images: number; videos: number; audios: number; music: number; total: number };
  credits: { in_circulation: number };
}

interface Health {
  status: string;
  database: { connected: boolean; latency_ms: number };
  background_tasks: { pending: number; processing: number; failed: number };
  recent_generations_24h: { images: number; videos: number; audios: number; music: number; total: number };
  server: { uptime_seconds: number; memory_usage_mb: number };
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats().then((res) => setStats(res.data)),
      getSystemHealth().then((res) => setHealth(res.data)).catch(() => {}),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Overview of your platform</p>
        </div>
        {health && (
          <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
            <span className={`w-2 h-2 rounded-full ${health.status === "healthy" ? "bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"}`} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {health.status === "healthy" ? "All systems operational" : "System degraded"}
            </span>
          </div>
        )}
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={loading ? null : stats?.users.total ?? 0} href="/users" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatCard label="Credits Sold" value={loading ? null : stats?.purchases.credits_sold ?? 0} href="/purchases" accent icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Transactions" value={loading ? null : stats?.purchases.completed ?? 0} href="/purchases" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        <StatCard label="Total Generations" value={loading ? null : stats?.generations.total ?? 0} href="/generations" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </div>

      {/* Generation breakdown + 24h activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* All-time generations */}
        {!loading && stats && (
          <div className="glass p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">All-Time Generations</h2>
            <div className="grid grid-cols-4 gap-3">
              <MiniStat label="Images" value={stats.generations.images} color="text-blue-400" />
              <MiniStat label="Videos" value={stats.generations.videos} color="text-purple-400" />
              <MiniStat label="Audio" value={stats.generations.audios} color="text-emerald-400" />
              <MiniStat label="Music" value={stats.generations.music} color="text-pink-400" />
            </div>
          </div>
        )}

        {/* 24h activity */}
        {health?.recent_generations_24h && (
          <div className="glass p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">Last 24 Hours</h2>
            <div className="grid grid-cols-5 gap-3">
              <MiniStat label="Images" value={health.recent_generations_24h.images} color="text-blue-400" />
              <MiniStat label="Videos" value={health.recent_generations_24h.videos} color="text-purple-400" />
              <MiniStat label="Audio" value={health.recent_generations_24h.audios} color="text-emerald-400" />
              <MiniStat label="Music" value={health.recent_generations_24h.music} color="text-pink-400" />
              <MiniStat label="Total" value={health.recent_generations_24h.total} color="text-[var(--accent-light)]" highlight />
            </div>
          </div>
        )}
      </div>

      {/* Infrastructure row */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats && <SmallStat label="Credits in Circulation" value={stats.credits.in_circulation.toLocaleString()} />}
          {health && (
            <>
              <SmallStat label="DB Latency" value={`${health.database?.latency_ms ?? "—"}ms`} />
              <SmallStat label="Pending Tasks" value={String(health.background_tasks?.pending ?? 0)} href="/system" warn={health.background_tasks?.pending > 0} />
              <SmallStat label="Failed Tasks" value={String(health.background_tasks?.failed ?? 0)} href="/system" warn={health.background_tasks?.failed > 0} />
            </>
          )}
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <QuickLink title="Users" desc="Manage user accounts" href="/users" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
        <QuickLink title="AI Models" desc="Model catalog & config" href="/models" icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517" />
        <QuickLink title="Pricing" desc="View model costs" href="/pricing" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1" />
        <QuickLink title="Generations" desc="All generated content" href="/generations" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16" />
        <QuickLink title="API Keys" desc="Manage API access" href="/api-keys" icon="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586" />
        <QuickLink title="Notifications" desc="Send push messages" href="/notifications" icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11" />
        <QuickLink title="System Health" desc="Monitor services" href="/system" icon="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2" />
        <QuickLink title="Beta Invite" desc="Send test invites" href="/beta-invite" icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href, accent, icon }: { label: string; value: number | null; href?: string; accent?: boolean; icon: string }) {
  const inner = (
    <div className="stat-card group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-[var(--accent-bg)]" : "bg-white/[0.04]"}`}>
          <svg className={`w-4 h-4 ${accent ? "text-[var(--accent-light)]" : "text-[var(--muted)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${accent ? "gradient-text" : ""}`}>
        {value === null ? <span className="skeleton inline-block w-16 h-7" /> : value.toLocaleString()}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function MiniStat({ label, value, color, highlight }: { label: string; value: number; color: string; highlight?: boolean }) {
  return (
    <div className={`text-center p-2 rounded-lg ${highlight ? "bg-[var(--accent-bg)]" : ""}`}>
      <p className="text-[11px] text-[var(--muted)]">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${color}`}>{value.toLocaleString()}</p>
    </div>
  );
}

function SmallStat({ label, value, href, warn }: { label: string; value: string; href?: string; warn?: boolean }) {
  const inner = (
    <div className="glass p-3 flex items-center justify-between">
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      <span className={`text-sm font-semibold font-mono ${warn ? "text-amber-400" : ""}`}>{value}</span>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function QuickLink({ title, desc, href, icon }: { title: string; desc: string; href: string; icon: string }) {
  return (
    <Link href={href} className="glass glass-hover p-4 block group transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center group-hover:bg-[var(--accent-bg)] transition-colors">
          <svg className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent-light)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-[11px] text-[var(--muted)]">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
