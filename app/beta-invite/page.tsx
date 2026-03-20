"use client";
import React, { useState } from "react";
import { sendBetaInvite } from "../lib/adminApi";

export default function BetaInvitePage() {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function addEmails() {
    const newEmails = emailInput.split(/[,\n]+/).map((e) => e.trim().toLowerCase()).filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    setEmails([...new Set([...emails, ...newEmails])]); setEmailInput("");
  }

  async function handleSend() {
    if (!emails.length) return;
    setSending(true); setResult(null); setError(null);
    try { const res = await sendBetaInvite(emails); setResult(res); } catch (e: any) { setError(e.message || "Failed"); }
    finally { setSending(false); }
  }

  return (
    <div className="max-w-2xl">
      <div className="page-header"><h1>Beta Invite</h1><p>Send beta testing invitations to testers</p></div>

      <div className="glass p-5 mb-4">
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Add tester emails</label>
        <div className="flex gap-2">
          <textarea value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addEmails(); } }}
            placeholder="Enter emails separated by commas or new lines..." rows={3} className="input flex-1" style={{ resize: "vertical" }} />
          <button onClick={addEmails} className="btn btn-primary self-end">Add</button>
        </div>
      </div>

      {emails.length > 0 && (
        <div className="glass p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted)]">{emails.length} recipient{emails.length !== 1 ? "s" : ""}</span>
            <button onClick={() => { setEmails([]); setResult(null); setError(null); }} className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors">Clear all</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {emails.map((email) => (
              <span key={email} className="badge badge-muted gap-1">
                {email}
                <button onClick={() => setEmails(emails.filter((e) => e !== email))} className="text-[var(--muted)] hover:text-red-400 ml-0.5">&times;</button>
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleSend} disabled={!emails.length || sending} className="btn btn-primary">
        {sending ? "Sending..." : `Send Beta Invite${emails.length > 0 ? ` to ${emails.length} tester${emails.length !== 1 ? "s" : ""}` : ""}`}
      </button>

      {result && (
        <div className="glass p-4 mt-4 border-emerald-500/20">
          <p className="text-sm font-medium text-emerald-400 mb-1">Invites sent!</p>
          <p className="text-sm text-[var(--muted-foreground)]">Sent: {result.sent} &middot; Failed: {result.failed} &middot; Total: {result.total}</p>
          {result.errors?.length > 0 && <div className="mt-2 text-xs text-red-400">{result.errors.map((err: string, i: number) => <p key={i}>{err}</p>)}</div>}
        </div>
      )}
      {error && <div className="glass p-4 mt-4 border-red-500/20"><p className="text-sm text-red-400">{error}</p></div>}
    </div>
  );
}
