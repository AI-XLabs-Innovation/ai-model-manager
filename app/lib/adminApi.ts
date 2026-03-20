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

// ─── System Health ────────────────────────────────────────────────────────────

export async function getSystemHealth() {
  return apiFetch("/health");
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export async function getPricing() {
  return apiFetch("/pricing");
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

// ─── Generations ──────────────────────────────────────────────────────────────

export async function listGenerations(
  params: { page?: number; limit?: number; type?: string; search?: string } = {}
) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.type) q.set("type", params.type);
  if (params.search) q.set("search", params.search);
  return apiFetch(`/generations?${q.toString()}`);
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export async function listApiKeys(params: { page?: number; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  return apiFetch(`/api-keys?${q.toString()}`);
}

export async function revokeApiKey(id: string) {
  return apiFetch(`/api-keys/${id}/revoke`, { method: "PUT" });
}

// ─── Background Tasks ────────────────────────────────────────────────────────

export async function listBackgroundTasks(params: { page?: number; limit?: number; status?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  return apiFetch(`/background-tasks?${q.toString()}`);
}

// ─── Landing Media ────────────────────────────────────────────────────────────

export async function getLandingMedia() {
  return apiFetch("/landing-media");
}

export async function addLandingMedia(mediaUrls: string[]) {
  return apiFetch("/landing-media", {
    method: "POST",
    body: JSON.stringify({ mediaUrls }),
  });
}

export async function deleteLandingMedia(id: string) {
  return apiFetch(`/landing-media/${id}`, { method: "DELETE" });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function sendPushNotification(title: string, body: string, userIds?: string[]) {
  return apiFetch("/notifications/push", {
    method: "POST",
    body: JSON.stringify({ title, body, userIds }),
  });
}

// ─── Email ────────────────────────────────────────────────────────────────────

async function emailFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase}/api/v1/email${path}`, {
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

export async function sendBetaInvite(emails: string[]) {
  return emailFetch("/send-beta-invite", {
    method: "POST",
    body: JSON.stringify({ emails }),
  });
}
