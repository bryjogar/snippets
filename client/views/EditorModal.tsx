import { useState, useEffect } from 'preact/hooks';
import { navigate } from '../router.js';
import { snippets, showToast } from '../store.js';
import { getSnippet, createSnippet, updateSnippet, deleteSnippet } from '../api.js';

const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'css', label: 'CSS' },
  { value: 'docker', label: 'Docker' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'yaml', label: 'YAML' },
];

interface FormData {
  title: string;
  content: string;
  language: string;
  tags: string;
}

export function EditorModal({ id, isNew }: { id?: string; isNew: boolean }) {
  const [form, setForm] = useState<FormData>({
    title: '', content: '', language: 'plaintext', tags: '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      // ── Web Share Target: pre-fill from incoming share data ──
      var shareData = (window as any).__shareData;
      if (shareData) {
        var title = shareData.title || '';
        var text = shareData.text || '';
        var url = shareData.url || '';
        // Build content from what was shared
        var content = '';
        if (url) content += url + '\n';
        if (text) content += text;
        // Auto-detect title if none given
        if (!title && url) {
          try {
            var parsed = new URL(url);
            title = parsed.hostname + parsed.pathname;
          } catch(e) { title = url; }
        }
        if (!title && text) title = text.slice(0, 80).split('\n')[0];
        if (!title) title = 'Shared item';
        setForm({ title: title, content: content.trim(), language: 'plaintext', tags: '' });
        delete (window as any).__shareData;
      }
      return;
    }
    if (!id) return;
    setLoading(true);
    getSnippet(id)
      .then((s: any) => {
        setForm({
          title: s.title,
          content: s.content,
          language: s.language || 'plaintext',
          tags: (s.tags || []).join(', '),
        });
        setLoading(false);
      })
      .catch(() => {
        showToast('Snippet not found', 'err');
        navigate('/');
      });
  }, [id]);

  function close() {
    navigate('/');
  }

  async function save() {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const data = { ...form, tags, language: form.language || 'plaintext' };

    if (!data.title.trim() || !data.content.trim()) {
      showToast('Title and code are required', 'err');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const created = await createSnippet(data as any);
        snippets.value = [created, ...snippets.value];
        showToast('Snippet created');
      } else {
        const updated = await updateSnippet(id!, data as any);
        const idx = snippets.value.findIndex(s => s.id === id);
        if (idx >= 0) {
          const copy = [...snippets.value];
          copy[idx] = updated;
          snippets.value = copy;
        }
        showToast('Snippet saved');
      }
      close();
    } catch (e: any) {
      showToast(e.message || 'Save failed', 'err');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isNew && id) {
      if (!confirm('Delete this snippet?')) return;
      try {
        await deleteSnippet(id);
        snippets.value = snippets.value.filter(s => s.id !== id);
        showToast('Deleted');
        close();
      } catch {
        showToast('Delete failed', 'err');
      }
    }
  }

  return (
    <div style={backdrop} onClick={close}>
      <div style={modal} onClick={(e: MouseEvent) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalHeader}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
            {isNew ? 'New Snippet' : loading ? 'Loading…' : 'Edit Snippet'}
          </h2>
          <button onClick={close} style={closeBtn}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text3)' }}>Loading…</div>
        ) : (
          <>
            {/* Form body */}
            <div style={modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div style={fieldCol}>
                  <label style={fieldLabel}>Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onInput={(e: any) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Docker Compose Setup"
                    style={inputStyle}
                  />
                </div>
                <div style={fieldCol}>
                  <label style={fieldLabel}>Language</label>
                  <select
                    value={form.language}
                    onChange={(e: any) => setForm({ ...form, language: e.target.value })}
                    style={selectStyle}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={fieldCol}>
                <label style={fieldLabel}>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onInput={(e: any) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. docker, compose, homelab"
                  style={inputStyle}
                />
              </div>

              <div style={{ ...fieldCol, flex: 1 }}>
                <label style={fieldLabel}>Code</label>
                <textarea
                  value={form.content}
                  onInput={(e: any) => setForm({ ...form, content: e.target.value })}
                  placeholder="// Paste your code here…"
                  spellcheck={false}
                  style={textareaStyle}
                  onKeyDown={(e: any) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') save();
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={modalFooter}>
              <div>
                {!isNew ? (
                  <button onClick={handleDelete} style={btnDelete}>
                    🗑 Delete
                  </button>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={close} style={btnCancel}>Cancel</button>
                <button onClick={save} disabled={saving} style={btnSave}>
                  {saving ? 'Saving…' : 'Save Snippet'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Styles ──
const backdrop: any = {
  position: 'fixed', inset: 0, zIndex: 500,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16, backdropFilter: 'blur(4px)',
};

const modal: any = {
  background: 'var(--surface)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: '0 0 60px rgba(0,0,0,0.6)',
  border: `1px solid var(--border)`,
  width: '100%', maxWidth: 900, maxHeight: '90vh',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
};

const modalHeader: any = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px',
  borderBottom: `1px solid var(--border-subtle)`,
};

const closeBtn: any = {
  width: 30, height: 30, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 16, color: 'var(--text3)', cursor: 'pointer',
  transition: 'background 0.15s',
};

const modalBody: any = {
  padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
  flex: 1, overflowY: 'auto', minHeight: 300,
};

const modalFooter: any = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px',
  borderTop: `1px solid var(--border-subtle)`,
  background: 'var(--bg)',
};

const fieldCol: any = { display: 'flex', flexDirection: 'column', gap: 4 };

const fieldLabel: any = {
  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 2,
};

const inputStyle: any = {
  width: '100%',
};

const selectStyle: any = {
  width: '100%',
  appearance: 'none',
  fontFamily: 'var(--font-body)', fontSize: 16,
  color: 'var(--text)', background: 'var(--bg)',
  border: `1px solid var(--border)`, borderRadius: 'var(--radius)',
  padding: '10px 14px', outline: 'none',
  cursor: 'pointer',
};

const textareaStyle: any = {
  width: '100%', flex: 1, minHeight: 250,
  fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.65,
  resize: 'vertical', color: 'var(--text)',
  background: 'var(--bg)', border: `1px solid var(--border)`,
  borderRadius: 'var(--radius)', padding: '14px 16px',
  outline: 'none', whiteSpace: 'pre', overflowWrap: 'normal',
  overflowX: 'auto',
};

const btnCancel: any = {
  padding: '9px 18px', borderRadius: 'var(--radius)',
  background: 'var(--surface-hover)', color: 'var(--text2)',
  fontWeight: 500, fontSize: 14, cursor: 'pointer',
};

const btnSave: any = {
  padding: '9px 24px', borderRadius: 'var(--radius)',
  background: 'var(--accent)', color: '#fff',
  fontWeight: 500, fontSize: 14, cursor: 'pointer',
  boxShadow: '0 2px 12px rgba(96, 165, 250, 0.25)',
};

const btnDelete: any = {
  padding: '9px 14px', borderRadius: 'var(--radius)',
  color: 'var(--red)', fontWeight: 500, fontSize: 13, cursor: 'pointer',
  background: 'none', border: 'none',
};
