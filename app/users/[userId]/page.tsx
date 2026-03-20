"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUserDetail, updateUserCredits } from "../../lib/adminApi";

interface Profile {
  id: string; email: string; full_name: string | null; avatar_id: string | null;
  credits: number; created_at: string; updated_at: string;
  revenuecat_app_user_id: string | null; expo_push_token: string | null; onboarding_data: any;
}
interface Purchase {
  id: string; transaction_id: string; package_type: string; credits_added: number;
  status: string; environment: string; purchased_at: string | null; created_at: string;
}
interface Generations { images: number; videos: number; audios: number; music: number; }

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [generations, setGenerations] = useState<Generations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditMsg, setCreditMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setError(null);
    try {
      const res = await getUserDetail(userId);
      setProfile(res.data.profile); setPurchases(res.data.purchases); setGenerations(res.data.generations);
    } catch (e: any) { setError(e.message || "Failed to load user"); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  async function handleCreditAdjust(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount === 0) { setCreditMsg({ type: "error", text: "Enter a valid non-zero number" }); return; }
    setCreditLoading(true); setCreditMsg(null);
    try {
      const res = await updateUserCredits(userId, amount, creditReason || undefined);
      setCreditMsg({ type: "success", text: `Credits updated: ${res.data.previous_credits} -> ${res.data.new_credits}` });
      setProfile((prev) => prev ? { ...prev, credits: res.data.new_credits } : prev);
      setCreditAmount(""); setCreditReason("");
    } catch (e: any) { setCreditMsg({ type: "error", text: e.message || "Failed to update credits" }); }
    finally { setCreditLoading(false); }
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16" />)}</div>;
  if (error || !profile) return (
    <div>
      <Link href="/users" className="text-[var(--accent-light)] text-sm hover:underline">Back to Users</Link>
      <p className="mt-4 text-red-400">{error || "User not found"}</p>
    </div>
  );

  const totalCreditsPurchased = purchases.filter((p) => p.status === "completed").reduce((sum, p) => sum + (Number(p.credits_added) || 0), 0);

  return (
    <div className="max-w-5xl">
      <Link href="/users" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Users
      </Link>

      {/* Profile header */}
      <div className="glass p-6 flex items-start gap-5 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {(profile.full_name || profile.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{profile.full_name || profile.email}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{profile.email}</p>
          <p className="text-xs text-[var(--muted)] font-mono mt-1">{profile.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--muted)]">Current Balance</p>
          <p className="text-2xl font-bold gradient-text">{(profile.credits ?? 0).toLocaleString()}</p>
          <p className="text-[10px] text-[var(--muted)]">credits</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="stat-card"><p className="text-[11px] text-[var(--muted)]">Credits Purchased</p><p className="text-xl font-bold mt-1">{totalCreditsPurchased.toLocaleString()}</p></div>
        <div className="stat-card"><p className="text-[11px] text-[var(--muted)]">Purchases</p><p className="text-xl font-bold mt-1">{purchases.length}</p></div>
        <div className="stat-card"><p className="text-[11px] text-[var(--muted)]">Total Generations</p><p className="text-xl font-bold mt-1">{generations ? Object.values(generations).reduce((a, b) => a + b, 0) : 0}</p></div>
        <div className="stat-card">
          <p className="text-[11px] text-[var(--muted)]">Breakdown</p>
          <div className="flex gap-2 mt-1.5 text-xs">
            {generations && <>
              <span className="text-blue-400">{generations.images} img</span>
              <span className="text-purple-400">{generations.videos} vid</span>
              <span className="text-emerald-400">{generations.audios} aud</span>
              <span className="text-pink-400">{generations.music} mus</span>
            </>}
          </div>
        </div>
      </div>

      {/* Credit adjustment */}
      <div className="glass p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Adjust Credits</h2>
        <form onSubmit={handleCreditAdjust} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-[11px] text-[var(--muted)] mb-1">Amount (+ add / - deduct)</label>
            <input type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="e.g. 100 or -50" className="input w-36" required />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] text-[var(--muted)] mb-1">Reason (optional)</label>
            <input type="text" value={creditReason} onChange={(e) => setCreditReason(e.target.value)} placeholder="Bonus, refund, etc." className="input" />
          </div>
          <button type="submit" disabled={creditLoading} className="btn btn-primary">{creditLoading ? "Saving..." : "Apply"}</button>
        </form>
        {creditMsg && <p className={`mt-2 text-sm ${creditMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>{creditMsg.text}</p>}
      </div>

      {/* Account info */}
      <div className="glass p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Account Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <InfoRow label="Joined" value={new Date(profile.created_at).toLocaleString()} />
          <InfoRow label="Last Updated" value={new Date(profile.updated_at).toLocaleString()} />
          <InfoRow label="RevenueCat ID" value={profile.revenuecat_app_user_id || "--"} mono />
          <InfoRow label="Push Token" value={profile.expo_push_token ? "Set" : "Not set"} />
        </div>
      </div>

      {/* Purchase history */}
      <div className="glass overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold">Purchase History ({purchases.length})</h2>
        </div>
        {purchases.length === 0 ? (
          <p className="p-5 text-sm text-[var(--muted)]">No purchases yet.</p>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Package</th><th className="text-right">Credits</th><th>Status</th><th>Env</th><th>Date</th><th>Transaction ID</th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.package_type}</td>
                  <td className="text-right font-mono text-emerald-400">+{p.credits_added}</td>
                  <td><span className={`badge ${p.status === "completed" ? "badge-success" : p.status === "failed" ? "badge-danger" : p.status === "pending" ? "badge-warning" : "badge-muted"}`}>{p.status}</span></td>
                  <td className="text-[var(--muted)] text-xs">{p.environment}</td>
                  <td className="text-[var(--muted)]">{new Date(p.purchased_at || p.created_at).toLocaleDateString()}</td>
                  <td className="font-mono text-xs text-[var(--muted)] truncate max-w-[140px]">{p.transaction_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
      <span className="text-[var(--muted)] text-xs">{label}</span>
      <span className={`text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
