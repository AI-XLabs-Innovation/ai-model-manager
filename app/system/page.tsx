"use client";
import React, { useEffect, useState } from "react";
import { getSystemHealth, listBackgroundTasks } from "../lib/adminApi";

export default function SystemPage() {
  const [health, setHealth] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskPage, setTaskPage] = useState(1);
  const [taskFilter, setTaskFilter] = useState("");
  const [taskTotal, setTaskTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSystemHealth().then((res) => setHealth(res.data)),
      listBackgroundTasks({ page: taskPage, limit: 15, status: taskFilter || undefined }).then((res) => { setTasks(res.data?.tasks ?? []); setTaskTotal(res.data?.total ?? 0); }),
    ]).catch(console.error).finally(() => setLoading(false));
  }, [taskPage, taskFilter]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="page-header" style={{ marginBottom: 0 }}><h1>System Health</h1><p>Monitor backend services and background tasks</p></div>
        <button onClick={() => { getSystemHealth().then((res) => setHealth(res.data)); }} className="btn btn-secondary btn-sm">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {health && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="stat-card">
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2.5 h-2.5 rounded-full ${health.status === "healthy" ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`} />
                <span className="text-lg font-bold">{health.status === "healthy" ? "Healthy" : "Degraded"}</span>
              </div>
            </div>
            <div className="stat-card"><p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">DB Latency</p><p className="text-lg font-bold mt-2">{health.database?.latency_ms ?? "--"}ms</p></div>
            <div className="stat-card"><p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Uptime</p><p className="text-lg font-bold mt-2">{health.server?.uptime_seconds ? `${Math.floor(health.server.uptime_seconds / 3600)}h ${Math.floor((health.server.uptime_seconds % 3600) / 60)}m` : "--"}</p></div>
            <div className="stat-card"><p className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Memory</p><p className="text-lg font-bold mt-2">{health.server?.memory_usage_mb ?? "--"} MB</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="glass p-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">Generations (24h)</h2>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { l: "Images", v: health.recent_generations_24h?.images, c: "text-blue-400" },
                  { l: "Videos", v: health.recent_generations_24h?.videos, c: "text-purple-400" },
                  { l: "Audio", v: health.recent_generations_24h?.audios, c: "text-emerald-400" },
                  { l: "Music", v: health.recent_generations_24h?.music, c: "text-pink-400" },
                  { l: "Total", v: health.recent_generations_24h?.total, c: "gradient-text" },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <p className="text-[10px] text-[var(--muted)]">{s.l}</p>
                    <p className={`text-lg font-bold ${s.c}`}>{s.v ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass p-5">
              <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">Background Tasks</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-[var(--warning-bg)]"><p className="text-[10px] text-amber-400">Pending</p><p className="text-lg font-bold text-amber-400">{health.background_tasks?.pending ?? 0}</p></div>
                <div className="text-center p-2 rounded-lg bg-[var(--accent-bg)]"><p className="text-[10px] text-[var(--accent-light)]">Processing</p><p className="text-lg font-bold text-[var(--accent-light)]">{health.background_tasks?.processing ?? 0}</p></div>
                <div className="text-center p-2 rounded-lg bg-[var(--danger-bg)]"><p className="text-[10px] text-red-400">Failed</p><p className="text-lg font-bold text-red-400">{health.background_tasks?.failed ?? 0}</p></div>
              </div>
            </div>
          </div>

          <div className="glass p-4 mb-6">
            <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
              <span>Node: <span className="text-[var(--foreground)]">{health.server?.node_version}</span></span>
              <span>Updated: <span className="text-[var(--foreground)]">{health.timestamp ? new Date(health.timestamp).toLocaleString() : "--"}</span></span>
            </div>
          </div>
        </>
      )}

      {/* Tasks table */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Recent Tasks</h2>
        <div className="flex gap-1.5">
          {["", "pending", "processing", "completed", "failed"].map((f) => (
            <button key={f} onClick={() => { setTaskFilter(f); setTaskPage(1); }} className={`btn btn-sm ${taskFilter === f ? "btn-primary" : "btn-secondary"}`}>{f || "All"}</button>
          ))}
        </div>
      </div>
      {tasks.length === 0 ? (
        <div className="glass p-6 text-center text-sm text-[var(--muted)]">No tasks found.</div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Type</th><th>Status</th><th>Created</th><th>Updated</th></tr></thead>
            <tbody>
              {tasks.map((task: any) => (
                <tr key={task.id}>
                  <td className="font-mono text-xs">{task.id?.slice(0, 8)}</td>
                  <td>{task.task_type || task.type || "--"}</td>
                  <td><span className={`badge ${task.status === "completed" ? "badge-success" : task.status === "processing" ? "badge-accent" : task.status === "failed" ? "badge-danger" : "badge-warning"}`}>{task.status}</span></td>
                  <td className="text-[var(--muted)]">{task.created_at ? new Date(task.created_at).toLocaleString() : "--"}</td>
                  <td className="text-[var(--muted)]">{task.updated_at ? new Date(task.updated_at).toLocaleString() : "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination justify-between">
        <span className="text-xs text-[var(--muted)]">{taskTotal} total</span>
        <div className="flex gap-1.5">
          <button onClick={() => setTaskPage(p => Math.max(1, p - 1))} disabled={taskPage <= 1}>Prev</button>
          <button onClick={() => setTaskPage(p => p + 1)} disabled={tasks.length < 15}>Next</button>
        </div>
      </div>
    </div>
  );
}
