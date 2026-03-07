"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getDashboardStats } from "./lib/adminApi";

interface Stats {
  users: { total: number };
  purchases: { total: number; completed: number; credits_sold: number };
  generations: { images: number; videos: number; audios: number; music: number; total: number };
  credits: { in_circulation: number };
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatTile label="Total Users" value={loading ? null : stats?.users.total ?? 0} href="/users" />
        <StatTile label="Credits Sold" value={loading ? null : stats?.purchases.credits_sold ?? 0} href="/purchases" accent />
        <StatTile label="Transactions" value={loading ? null : stats?.purchases.completed ?? 0} href="/purchases" />
        <StatTile label="Total Generations" value={loading ? null : stats?.generations.total ?? 0} />
      </div>

      {/* Generation breakdown */}
      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatTile label="Images" value={stats.generations.images} small />
          <StatTile label="Videos" value={stats.generations.videos} small />
          <StatTile label="Audio" value={stats.generations.audios} small />
          <StatTile label="Music" value={stats.generations.music} small />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink title="User Management" desc="View, search, and adjust credits for all users." href="/users" />
        <QuickLink title="Purchases" desc="Browse credit transactions and purchase stats." href="/purchases" />
        <QuickLink title="AI Models" desc="Manage AI model catalog, categories, and providers." href="/models" />
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

function QuickLink({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="block p-5 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
    >
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-gray-400 mt-1">{desc}</p>
    </Link>
  );
}
