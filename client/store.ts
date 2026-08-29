import { signal, computed } from '@preact/signals';
import type { Snippet } from '../server/types.js';
import { listSnippets, getAllTags, getAllLanguages, getSnippet } from './api.js';

// ── Data ──
export const snippets = signal<Snippet[]>([]);
export const totalCount = signal(0);
export const searchQuery = signal('');
export const activeTag = signal('');
export const activeLanguage = signal('');
export const editingId = signal<string | null>(null);
export const toast = signal<{ message: string; kind: 'ok' | 'err' } | null>(null);
export const tags = signal<string[]>([]);
export const languages = signal<string[]>([]);

// ── Derived ──
export const filteredSnippets = computed(() => {
  let items = snippets.value;
  const q = searchQuery.value.toLowerCase();
  if (q) {
    items = items.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  return items;
});

// ── Helpers ──
export function setSnippets(items: Snippet[], total: number) {
  snippets.value = items;
  totalCount.value = total;
}

export function upsertSnippet(item: Snippet) {
  const idx = snippets.value.findIndex(s => s.id === item.id);
  if (idx >= 0) {
    const updated = [...snippets.value];
    updated[idx] = item;
    snippets.value = updated;
  } else {
    snippets.value = [item, ...snippets.value];
  }
}

export function removeSnippet(id: string) {
  snippets.value = snippets.value.filter(s => s.id !== id);
}

export function showToast(message: string, kind: 'ok' | 'err' = 'ok') {
  toast.value = { message, kind };
  setTimeout(() => { toast.value = null; }, 2500);
}

// ── Sidebar data loading ──
export async function loadSidebarData() {
  try {
    const [tagList, langList] = await Promise.all([getAllTags(), getAllLanguages()]);
    tags.value = tagList;
    languages.value = langList;
  } catch { /* tags are optional, don't block */ }
}
