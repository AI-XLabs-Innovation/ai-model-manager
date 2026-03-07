"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUserDetail, updateUserCredits } from "../../lib/adminApi";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
  revenuecat_app_user_id: string | null;
  push_token: string | null;
  onboarding_data: any;
}

interface Purchase {
  id: string;
  transaction_id: string;
  package_type: string;
  credits_added: number;
  status: string;
  environment: string;
  purchased_at: string | null;
  created_at: string;
}

interface Generations {
  images: number;
  videos: number;
  audios: number;
  music: number;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400 bg-green-900/30",
  pending: "text-yellow-400 bg-yellow-900/30",
  failed: "text-red-400 bg-red-900/30",
  refunded: "text-gray-400 bg-gray-800",
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.userId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [generations, setGenerations] = useState<Generations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Credit adjustment state
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditMsg, setCreditMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getUserDetail(userId);
      setProfile(res.data.profile);
      setPurchases(res.data.purchases);
      setGenerations(res.data.generations);
    } catch (e: any) {
      setError(e.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  async function handleCreditAdjust(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount === 0) {
      setCreditMsg({ type: "error", text: "Enter a valid non-zero number" });
      return;
    }
    setCreditLoading(true);
    setCreditMsg(null);
    try {
      const res = await updateUserCredits(userId, amount, creditReason || undefined);
      setCreditMsg({
        type: "success",
        text: `Credits updated: ${res.data.previous_credits} → ${res.data.new_credits}`,
      });
      // Refresh profile data
      setProfile((prev) => prev ? { ...prev, credits: res.data.new_credits } : prev);
      setCreditAmount("");
      setCreditReason("");
    } catch (e: any) {
      setCreditMsg({ type: "error", text: e.message || "Failed to update credits" });
    } finally {
      setCreditLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <Link href="/users" className="text-blue-500 text-sm">← Back to Users</Link>
        <p className="mt-4 text-red-400">{error || "User not found"}</p>
      </div>
    );
  }

  const totalCreditsPurchased = purchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (Number(p.credits_added) || 0), 0);

  return (
    <div className="p-6 max-w-5xl">
      <Link href="/users" className="text-blue-500 text-sm hover:underline">← Back to Users</Link>

      {/* Profile header */}
      <div className="mt-6 flex items-start gap-6">
        {profile.avatar_url && (
          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name || profile.email}</h1>
          <p className="text-gray-400 mt-1">{profile.email}</p>
          <p className="text-xs text-gray-500 mt-1 font-mono">{profile.id}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Credits" value={profile.credits ?? 0} accent />
        <StatCard label="Credits Purchased" value={totalCreditsPurchased} />
        <StatCard label="Purchases" value={purchases.length} />
        <StatCard label="Total Generations" value={generations ? Object.values(generations).reduce((a, b) => a + b, 0) : 0} />
      </div>

      {/* Generation breakdown */}
      {generations && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Images" value={generations.images} small />
          <StatCard label="Videos" value={generations.videos} small />
          <StatCard label="Audio" value={generations.audios} small />
          <StatCard label="Music" value={generations.music} small />
        </div>
      )}

      {/* Credit adjustment */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Adjust Credits</h2>
        <form onSubmit={handleCreditAdjust} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Amount (+ add / − deduct)</label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="e.g. 100 or -50"
              className="border rounded px-3 py-2 text-sm bg-transparent w-36"
              required
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-gray-400 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              placeholder="Bonus, refund, etc."
              className="w-full border rounded px-3 py-2 text-sm bg-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={creditLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {creditLoading ? "Saving…" : "Apply"}
          </button>
        </form>
        {creditMsg && (
          <p className={`mt-2 text-sm ${creditMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {creditMsg.text}
          </p>
        )}
      </div>

      {/* Account info */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Account Info</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <InfoRow label="Joined" value={new Date(profile.created_at).toLocaleString()} />
          <InfoRow label="Last Updated" value={new Date(profile.updated_at).toLocaleString()} />
          <InfoRow label="RevenueCat ID" value={profile.revenuecat_app_user_id || "—"} mono />
          <InfoRow label="Push Token" value={profile.push_token ? "✓ Set" : "—"} />
        </dl>
      </div>

      {/* Purchase history */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Purchase History ({purchases.length})</h2>
        {purchases.length === 0 ? (
          <p className="text-gray-500 text-sm">No purchases yet.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-gray-400">
                  <th className="px-4 py-2 font-medium">Package</th>
                  <th className="px-4 py-2 font-medium text-right">Credits</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Env</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium text-xs">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2 font-medium">{p.package_type}</td>
                    <td className="px-4 py-2 text-right font-mono text-green-400">+{p.credits_added}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[p.status] || "text-gray-400 bg-gray-800"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{p.environment}</td>
                    <td className="px-4 py-2 text-gray-400">
                      {new Date(p.purchased_at || p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-500 truncate max-w-[160px]">
                      {p.transaction_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, small }: { label: string; value: number; accent?: boolean; small?: boolean }) {
  return (
    <div className="p-4 rounded border border-white/10 bg-white/5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`font-bold mt-1 ${small ? "text-lg" : "text-2xl"} ${accent ? "text-blue-400" : ""}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="py-1">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`text-gray-200 ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</dd>
    </div>
  );
}
