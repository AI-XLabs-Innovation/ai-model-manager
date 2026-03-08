"use client";
import React, { useState } from "react";
import { sendBetaInvite } from "../lib/adminApi";

export default function BetaInvitePage() {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    total?: number;
    sent?: number;
    failed?: number;
    errors?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addEmails() {
    const newEmails = emailInput
      .split(/[,\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const unique = [...new Set([...emails, ...newEmails])];
    setEmails(unique);
    setEmailInput("");
  }

  function removeEmail(email: string) {
    setEmails(emails.filter((e) => e !== email));
  }

  function clearAll() {
    setEmails([]);
    setResult(null);
    setError(null);
  }

  async function handleSend() {
    if (emails.length === 0) return;
    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await sendBetaInvite(emails);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Failed to send invites");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Beta Invite</h1>
      <p className="text-sm text-gray-400 mb-6">
        Send the Versely beta testing invite email to internal testers.
      </p>

      {/* Email input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Add tester emails
        </label>
        <div className="flex gap-2">
          <textarea
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addEmails();
              }
            }}
            placeholder="Enter emails separated by commas or new lines…"
            rows={3}
            className="flex-1 border border-white/10 rounded px-3 py-2 text-sm bg-transparent resize-none focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addEmails}
            className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Email list */}
      {emails.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              {emails.length} recipient{emails.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {emails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm"
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="text-gray-500 hover:text-red-400 ml-1 text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={emails.length === 0 || sending}
        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
      >
        {sending
          ? "Sending…"
          : `Send Beta Invite${emails.length > 0 ? ` to ${emails.length} tester${emails.length !== 1 ? "s" : ""}` : ""}`}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 p-4 rounded border border-green-700/50 bg-green-900/20">
          <p className="text-sm font-medium text-green-400 mb-1">Invites sent!</p>
          <p className="text-sm text-gray-300">
            Sent: {result.sent} · Failed: {result.failed} · Total: {result.total}
          </p>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-2 text-xs text-red-400">
              {result.errors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded border border-red-700/50 bg-red-900/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
