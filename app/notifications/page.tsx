"use client";
import React, { useState } from "react";
import { sendPushNotification } from "../lib/adminApi";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userIds, setUserIds] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { alert("Title and body are required"); return; }
    if (!confirm(`Send push notification to ${userIds.trim() ? "selected users" : "ALL users"}?`)) return;
    setSending(true); setResult(null);
    try {
      const ids = userIds.split(/[\n,]/).map((u) => u.trim()).filter(Boolean);
      const res = await sendPushNotification(title, body, ids.length > 0 ? ids : undefined);
      setResult(res.data);
    } catch (e: any) { alert("Failed: " + (e.message || "Unknown error")); }
    finally { setSending(false); }
  };

  return (
    <div className="max-w-xl">
      <div className="page-header"><h1>Push Notifications</h1><p>Send push notifications to app users via Expo</p></div>

      <div className="glass p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title..." className="input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notification message..." className="input" rows={3} style={{ resize: "vertical" }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">User IDs <span className="text-[var(--muted)]">(optional, empty = all users)</span></label>
          <textarea value={userIds} onChange={(e) => setUserIds(e.target.value)} placeholder="Paste user IDs (comma or newline separated)..." className="input" rows={3} style={{ resize: "vertical" }} />
        </div>
        <button onClick={handleSend} disabled={sending || !title.trim() || !body.trim()} className="btn btn-primary w-full">
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </div>

      {result && (
        <div className="glass p-4 mt-4">
          <h3 className="text-xs font-semibold mb-2">Result</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-[var(--muted)]">Sent: <span className="text-emerald-400 font-semibold">{result.sent}</span></span>
            <span className="text-[var(--muted)]">Queried: <span className="text-[var(--foreground)]">{result.total_users}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
