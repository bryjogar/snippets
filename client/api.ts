import type { Snippet, CreateSnippet, UpdateSnippet } from '../server/types.js';

const BASE = '/api/snippets';

function token(): string {
  return localStorage.getItem('snippets-token') || '';
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token()) h['Authorization'] = `Bearer ${token()}`;
  return h;
}

async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined;
  return res.json();
}

export async function listSnippets(params?: { q?: string; tag?: string; language?: string; limit?: number; skip?: number }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.tag) qs.set('tag', params.tag);
  if (params?.language) qs.set('language', params.language);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.skip) qs.set('skip', String(params.skip));
  const res = await fetch(`${BASE}?${qs}`, { headers: headers() });
  return handle(res) as Promise<{ items: Snippet[]; total: number }>;
}

export async function getSnippet(id: string) {
  const res = await fetch(`${BASE}/${id}`, { headers: headers() });
  return handle(res) as Promise<Snippet>;
}

export async function createSnippet(data: CreateSnippet) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handle(res) as Promise<Snippet>;
}

export async function updateSnippet(id: string, data: UpdateSnippet) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handle(res) as Promise<Snippet>;
}

export async function deleteSnippet(id: string) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  return handle(res);
}

export async function getAllTags() {
  const res = await fetch(`${BASE}/-/tags`, { headers: headers() });
  return handle(res) as Promise<string[]>;
}

export async function getAllLanguages() {
  const res = await fetch(`${BASE}/-/languages`, { headers: headers() });
  return handle(res) as Promise<string[]>;
}

export function setToken(t: string) {
  localStorage.setItem('snippets-token', t);
}

export function getToken(): string {
  return token();
}
