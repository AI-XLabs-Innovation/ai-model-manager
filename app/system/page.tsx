"use client";
import React, { useEffect, useState } from "react";
import { getSystemHealth, listBackgroundTasks } from "../lib/adminApi";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${ok ? "bg-green-500" : "bg-red-500"}`} />
  );
}

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
      listBackgroundTasks({ page: taskPage, limit: 15, status: taskFilter || undefined }).then((res) => {
        setTasks(res.data?.tasks ?? []);
        setTaskTotal(res.data?.total ?? 0);
      }),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [taskPage, taskFilter]);

  const refreshHealth = () => {
    getSystemHealth().then((res) => setHealth(res.data)).catch(console.error);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor backend services and background tasks</p>
        </div>
        <button
          onClick={refreshHealth}
          className="text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      {health && (
        <>
          {/* Overall Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded border border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">Status</p>
              <p className="text-lg font-bold mt-1 flex items-center">
                <StatusDot ok={health.status === "healthy"} />
                {health.status === "healthy" ? "Healthy" : "Degraded"}
              </p>
            </div>
            <div className="p-4 rounded border border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">DB Latency</p>
              <p className="text-lg font-bold mt-1">{health.database?.latency_ms ?? "—"}ms</p>
            </div>
            <div className="p-4 rounded border border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">Uptime</p>
              <p className="text-lg font-bold mt-1">
                {health.server?.uptime_seconds
                  ? `${Math.floor(health.server.uptime_seconds / 3600)}h ${Math.floor((health.server.uptime_seconds % 3600) / 60)}m`
                  : "—"}
              </p>
            </div>
            <div className="p-4 rounded border border-white/10 bg-white/5">
              <p className="text-xs text-gray-400">Memory Usage</p>
              <p className="text-lg font-bold mt-1">{health.server?.memory_usage_mb ?? "—"} MB</p>
            </div>
          </div>

          {/* Generations last 24h */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Generations (Last 24h)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded border border-white/10 bg-white/5 text-center">
                <p className="text-xs text-gray-400">Images</p>
                <p className="text-xl font-bold mt-1">{health.recent_generations_24h?.images ?? 0}</p>
              </div>
              <div className="p-3 rounded border border-white/10 bg-white/5 text-center">
                <p className="text-xs text-gray-400">Videos</p>
                <p className="text-xl font-bold mt-1">{health.recent_generations_24h?.videos ?? 0}</p>
              </div>
              <div className="p-3 rounded border border-white/10 bg-white/5 text-center">
                <p className="text-xs text-gray-400">Audio</p>
                <p className="text-xl font-bold mt-1">{health.recent_generations_24h?.audios ?? 0}</p>
              </div>
              <div className="p-3 rounded border border-white/10 bg-white/5 text-center">
                <p className="text-xs text-gray-400">Music</p>
                <p className="text-xl font-bold mt-1">{health.recent_generations_24h?.music ?? 0}</p>
              </div>
              <div className="p-3 rounded border border-blue-500/20 bg-blue-500/5 text-center">
                <p className="text-xs text-blue-400">Total</p>
                <p className="text-xl font-bold mt-1 text-blue-400">{health.recent_generations_24h?.total ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Background Tasks Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Background Tasks</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded border border-yellow-500/20 bg-yellow-500/5 text-center">
                <p className="text-xs text-yellow-400">Pending</p>
                <p className="text-xl font-bold mt-1 text-yellow-400">{health.background_tasks?.pending ?? 0}</p>
              </div>
              <div className="p-3 rounded border border-blue-500/20 bg-blue-500/5 text-center">
                <p className="text-xs text-blue-400">Processing</p>
                <p className="text-xl font-bold mt-1 text-blue-400">{health.background_tasks?.processing ?? 0}</p>
              </div>
              <div className="p-3 rounded border border-red-500/20 bg-red-500/5 text-center">
                <p className="text-xs text-red-400">Failed</p>
                <p className="text-xl font-bold mt-1 text-red-400">{health.background_tasks?.failed ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Server Info */}
          <div className="mb-6 p-4 rounded border border-white/10 bg-white/5">
            <h2 className="text-sm font-semibold mb-2">Server Info</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-400">
              <div>Node: <span className="text-gray-200">{health.server?.node_version ?? "—"}</span></div>
              <div>Timestamp: <span className="text-gray-200">{health.timestamp ? new Date(health.timestamp).toLocaleString() : "—"}</span></div>
            </div>
          </div>
        </>
      )}

      {/* Background Tasks Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <div className="flex gap-2">
            {["", "pending", "processing", "completed", "failed"].map((f) => (
              <button
                key={f}
                onClick={() => { setTaskFilter(f); setTaskPage(1); }}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  taskFilter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                {f || "All"}
              </button>
            ))}
          </div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-gray-400 text-sm">No tasks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">ID</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Created</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task: any) => (
                  <tr key={task.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2 font-mono text-xs text-gray-300">{task.id?.slice(0, 8)}</td>
                    <td className="py-2 px-2 text-gray-300">{task.task_type || task.type || "—"}</td>
                    <td className="py-2 px-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        task.status === "completed" ? "bg-green-100 text-green-800" :
                        task.status === "processing" ? "bg-blue-100 text-blue-800" :
                        task.status === "failed" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-400">{task.created_at ? new Date(task.created_at).toLocaleString() : "—"}</td>
                    <td className="py-2 px-2 text-gray-400">{task.updated_at ? new Date(task.updated_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-400">{taskTotal} total</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
              disabled={taskPage <= 1}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-50"
            >Prev</button>
            <span className="text-xs">{taskPage}</span>
            <button
              onClick={() => setTaskPage((p) => p + 1)}
              disabled={tasks.length < 15}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs disabled:opacity-50"
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
