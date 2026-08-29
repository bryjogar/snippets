import { useState, useEffect } from 'preact/hooks';
import { useSignalValue } from '../hooks.js';
import { navigate } from '../router.js';
import {
  editingId, snippets, showToast,
} from '../store.js';
import { getSnippet, createSnippet, updateSnippet, deleteSnippet } from '../api.js';

interface FormData {
  title: string;
  content: string;
  language: string;
  tags: string;
}

export function SnippetEdit({ id }: { id?: string }) {
  const isNew = !id;

  const [form, setForm] = useState<FormData>({
    title: '', content: '', language: '', tags: '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const toastVal = useSignalValue(showToast);

  useEffect(() => {
    if (isNew) {
      editingId.value = null;
      return;
    }
    editingId.value = id;
    getSnippet(id)
      .then((s: any) => {
        setForm({
          title: s.title,
          content: s.content,
          language: s.language || '',
          tags: s.tags.join(', '),
        });
        setLoading(false);
      })
      .catch(() => {
        showToast('Snippet not found', 'err');
        navigate('/');
      });
  }, [id]);

  async function save() {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const data = { ...form, tags };

    if (!data.title.trim() || !data.content.trim()) {
      showToast('Title and content are required', 'err');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createSnippet(data as any);
        showToast('Created');
      } else {
        await updateSnippet(id!, data as any);
        showToast('Saved');
      }
      navigate('/');
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'err');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this snippet?')) return;
    try {
      await deleteSnippet(id!);
      snippets.value = snippets.value.filter(s => s.id !== id);
      showToast('Deleted');
      navigate('/');
    } catch {
      showToast('Delete failed', 'err');
    }
  }

  if (loading) {
    return <div style={center}>Loading&hellip;</div>;
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Title */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Snippet title..."
          value={form.title}
          onInput={(e: any) => setForm({ ...form, title: e.target.value })}
          style={{ width: '100%', fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-body)' }}
          onKeyDown={(e: any) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') save();
          }}
        />
      </div>

      {/* Language + Tags row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Language (e.g. python, bash, sql)"
          value={form.language}
          onInput={(e: any) => setForm({ ...form, language: e.target.value })}
          style={{ flex: 1, minWidth: 160 }}
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={form.tags}
          onInput={(e: any) => setForm({ ...form, tags: e.target.value })}
          style={{ flex: 2, minWidth: 200 }}
        />
      </div>

      {/* Content - BIG textarea */}
      <textarea
        placeholder="Paste or type your snippet..."
        value={form.content}
        onInput={(e: any) => setForm({ ...form, content: e.target.value })}
        style={{
          width: '100%', minHeight: 300, fontFamily: 'var(--font-mono)',
          fontSize: 14, lineHeight: 1.7, resize: 'vertical',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '14px 16px',
          color: 'var(--text)',
        }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
        <button onClick={save} disabled={saving} style={{
          ...btnPrimary, opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving\u2026' : isNew ? 'Create' : 'Save'}
        </button>
        <button onClick={() => navigate('/')} style={btnSecondary}>
          Cancel
        </button>
        {!isNew ? (
          <button onClick={handleDelete} style={{ ...btnSecondary, color: 'var(--red)', marginLeft: 'auto' }}>
            Delete
          </button>
        ) : null}
      </div>

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
        Ctrl+Enter to save
      </div>
    </div>
  );
}

const center: any = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: '100%', color: 'var(--text3)',
};

const btnPrimary: any = {
  padding: '10px 24px', borderRadius: 'var(--radius)',
  background: 'var(--accent)', color: '#fff',
  fontWeight: 500, fontSize: 15, cursor: 'pointer',
};

const btnSecondary: any = {
  padding: '10px 16px', borderRadius: 'var(--radius)',
  background: 'var(--surface-hover)', color: 'var(--text2)',
  fontWeight: 500, fontSize: 15, cursor: 'pointer',
};
