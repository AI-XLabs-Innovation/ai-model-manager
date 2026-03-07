"use client";
import { getAuthHeaders } from './apiUtils';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

export async function createModel(payload: any) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase}/api/v1/ai-models`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateModel(slug: string, payload: any) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase}/api/v1/ai-models/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteModel(slug: string, soft = true) {
  const headers = await getAuthHeaders();
  const url = `${apiBase}/api/v1/ai-models/${encodeURIComponent(slug)}${soft ? '?soft=true' : ''}`;
  const res = await fetch(url, { 
    method: 'DELETE',
    headers
  });
  return res.json();
}

export async function getModel(slug: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${apiBase}/api/v1/ai-models/${encodeURIComponent(slug)}`, {
    headers
  });
  return res.json();
}

export default { createModel, updateModel, deleteModel, getModel };
