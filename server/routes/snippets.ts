import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '../db.js';
import { createSnippetSchema, updateSnippetSchema } from '../types.js';
import type { Snippet } from '../types.js';

const router = Router();

const collection = () => getCollection<Snippet>('snippets');

function now(): string {
  return new Date().toISOString();
}

// ── List / Search ──
router.get('/', async (req: Request, res: Response) => {
  const { q, tag, language, limit: limitStr, skip: skipStr } = req.query;

  const filter: Record<string, unknown> = {};
  if (typeof q === 'string' && q) {
    filter.$text = { $search: q };
  }
  if (typeof tag === 'string' && tag) {
    filter.tags = tag;
  }
  if (typeof language === 'string' && language) {
    filter.language = language;
  }

  const limit = Math.min(parseInt(limitStr as string) || 50, 200);
  const skip = parseInt(skipStr as string) || 0;

  const [items, total] = await Promise.all([
    collection().find(filter).sort({ updated: -1 }).skip(skip).limit(limit).toArray(),
    collection().countDocuments(filter),
  ]);

  res.json({ items, total, limit, skip });
});

// ── Get one ──
router.get('/:id', async (req: Request, res: Response) => {
  const item = await collection().findOne({ id: req.params.id });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// ── Create ──
router.post('/', async (req: Request, res: Response) => {
  const parsed = createSnippetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const ts = now();
  const doc: Snippet = {
    _id: new ObjectId().toString(),
    id: uuidv4(),
    ...parsed.data,
    created: ts,
    updated: ts,
  };

  await collection().insertOne(doc);
  res.status(201).json(doc);
});

// ── Update ──
router.put('/:id', async (req: Request, res: Response) => {
  const parsed = updateSnippetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const result = await collection().findOneAndUpdate(
    { id: req.params.id },
    { $set: { ...parsed.data, updated: now() } },
    { returnDocument: 'after' }
  );

  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
});

// ── Delete ──
router.delete('/:id', async (req: Request, res: Response) => {
  const result = await collection().deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

// ── Get all tags (for sidebar filter) ──
router.get('/-/tags', async (_req: Request, res: Response) => {
  const tags = await collection().distinct('tags');
  res.json(tags.sort());
});

// ── Get all languages (for filter) ──
router.get('/-/languages', async (_req: Request, res: Response) => {
  const languages = await collection().distinct('language');
  res.json(languages.filter(Boolean).sort());
});

export default router;
