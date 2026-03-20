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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {health && (
          <div className="flex items-center gap-2 text-sm">
            <span className={`inline-block w-2 h-2 rounded-full ${health.status === "healthy" ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-gray-400">{health.status === "healthy" ? "All systems operational" : "System degraded"}</span>
          </div>
        )}
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Users" value={loading ? null : stats?.users.total ?? 0} href="/users" />
        <StatTile label="Credits Sold" value={loading ? null : stats?.purchases.credits_sold ?? 0} href="/purchases" accent />
        <StatTile label="Transactions" value={loading ? null : stats?.purchases.completed ?? 0} href="/purchases" />
        <StatTile label="Total Generations" value={loading ? null : stats?.generations.total ?? 0} href="/generations" />
      </div>

      {/* Generation breakdown */}
      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatTile label="Images" value={stats.generations.images} small />
          <StatTile label="Videos" value={stats.generations.videos} small />
          <StatTile label="Audio" value={stats.generations.audios} small />
          <StatTile label="Music" value={stats.generations.music} small />
        </div>
      )}

      {/* 24h activity */}
      {health?.recent_generations_24h && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">LAST 24 HOURS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <MiniStat label="Images" value={health.recent_generations_24h.images} />
            <MiniStat label="Videos" value={health.recent_generations_24h.videos} />
            <MiniStat label="Audio" value={health.recent_generations_24h.audios} />
            <MiniStat label="Music" value={health.recent_generations_24h.music} />
            <MiniStat label="Total" value={health.recent_generations_24h.total} accent />
          </div>
        </div>
      )}

      {/* Credits in circulation */}
      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatTile label="Credits in Circulation" value={stats.credits.in_circulation} />
          {health && (
            <>
              <StatTile label="Pending Tasks" value={health.background_tasks.pending} href="/system" />
              <StatTile label="Failed Tasks" value={health.background_tasks.failed} href="/system" />
            </>
          )}
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-gray-400 mb-3">QUICK LINKS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <QuickLink title="User Management" desc="View, search, and adjust credits for users." href="/users" />
        <QuickLink title="Purchases" desc="Browse credit transactions and purchase stats." href="/purchases" />
        <QuickLink title="AI Models" desc="Manage model catalog, categories, and providers." href="/models" />
        <QuickLink title="Model Pricing" desc="View pricing for all AI models." href="/pricing" />
        <QuickLink title="Generations" desc="View all AI-generated content." href="/generations" />
        <QuickLink title="API Keys" desc="Manage user API keys." href="/api-keys" />
        <QuickLink title="Landing Media" desc="Manage explore page media." href="/landing-media" />
        <QuickLink title="Push Notifications" desc="Send notifications to app users." href="/notifications" />
        <QuickLink title="System Health" desc="Monitor backend services and tasks." href="/system" />
        <QuickLink title="Providers" desc="View AI model providers." href="/providers" />
        <QuickLink title="Beta Invite" desc="Send beta invite emails." href="/beta-invite" />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  href,
  accent,
  small,
}: {
  label: string;
  value: number | null;
  href?: string;
  accent?: boolean;
  small?: boolean;
}) {
  const inner = (
    <div className="p-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`font-bold mt-1 ${small ? "text-xl" : "text-3xl"} ${accent ? "text-blue-400" : ""}`}>
        {value === null ? <span className="opacity-30 animate-pulse">—</span> : value.toLocaleString()}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`p-3 rounded border ${accent ? "border-blue-500/20 bg-blue-500/5" : "border-white/10 bg-white/5"} text-center`}>
      <p className={`text-xs ${accent ? "text-blue-400" : "text-gray-400"}`}>{label}</p>
      <p className={`text-lg font-bold mt-1 ${accent ? "text-blue-400" : ""}`}>{value.toLocaleString()}</p>
    </div>
  );
}

function QuickLink({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="block p-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
    >
      <h2 className="font-semibold text-sm">{title}</h2>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </Link>
  );
}
