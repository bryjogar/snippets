import { z } from 'zod';

// ── MongoDB document interface ──
export interface Snippet {
  _id: string;
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  created: string;
  updated: string;
}

// ── Zod schemas ──
export const createSnippetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  language: z.string().max(50).default(''),
  tags: z.array(z.string().max(50)).default([]),
});

export const updateSnippetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  language: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).optional(),
});

export type CreateSnippet = z.infer<typeof createSnippetSchema>;
export type UpdateSnippet = z.infer<typeof updateSnippetSchema>;
