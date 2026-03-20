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
    if (!title.trim() || !body.trim()) {
      alert("Title and body are required");
      return;
    }
    if (!confirm(`Send push notification to ${userIds.trim() ? "selected users" : "ALL users"}?`)) return;

    setSending(true);
    setResult(null);
    try {
      const ids = userIds
        .split(/[\n,]/)
        .map((u) => u.trim())
        .filter(Boolean);
      const res = await sendPushNotification(title, body, ids.length > 0 ? ids : undefined);
      setResult(res.data);
    } catch (e: any) {
      alert("Failed to send: " + (e.message || "Unknown error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Push Notifications</h1>
      <p className="text-sm text-gray-400 mb-6">Send push notifications to app users via Expo</p>

      <div className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title..."
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Notification message..."
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            User IDs <span className="text-gray-400">(optional, leave empty to send to all)</span>
          </label>
          <textarea
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
            placeholder="Paste user IDs (one per line or comma-separated)..."
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Notification"}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Result</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Sent to:</span>
                <span className="ml-2 font-medium text-green-400">{result.sent} users</span>
              </div>
              <div>
                <span className="text-gray-400">Total users queried:</span>
                <span className="ml-2">{result.total_users}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
