"use client";
import { getAuthHeaders } from "./apiUtils";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

async function apiFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase}/api/v1/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(options?.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  return apiFetch("/stats");
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(params: { page?: number; limit?: number; search?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  return apiFetch(`/users?${q.toString()}`);
}

export async function getUserDetail(userId: string) {
  return apiFetch(`/users/${userId}`);
}

export async function updateUserCredits(userId: string, amount: number, reason?: string) {
  return apiFetch(`/users/${userId}/credits`, {
    method: "PUT",
    body: JSON.stringify({ amount, reason }),
  });
}

// ─── Purchases ────────────────────────────────────────────────────────────────

export async function listPurchases(
  params: { page?: number; limit?: number; status?: string; environment?: string; search?: string } = {}
) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  if (params.environment) q.set("environment", params.environment);
  if (params.search) q.set("search", params.search);
  return apiFetch(`/purchases?${q.toString()}`);
}

export async function getPurchaseStats() {
  return apiFetch("/purchases/stats");
}
