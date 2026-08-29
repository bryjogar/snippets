import { useEffect } from 'preact/hooks';
import { useSignalValue } from '../hooks.js';
import { navigate } from '../router.js';
import {
  snippets, searchQuery, activeTag, activeLanguage, showToast, totalCount,
} from '../store.js';
import { listSnippets, deleteSnippet } from '../api.js';

const LANGUAGES = [
  'plaintext', 'bash', 'css', 'docker', 'html', 'javascript',
  'json', 'nginx', 'powershell', 'python', 'sql', 'typescript', 'yaml',
];

export function SnippetList() {
  const items = useSignalValue(snippets);
  const q = useSignalValue(searchQuery);
  const tag = useSignalValue(activeTag);
  const lang = useSignalValue(activeLanguage);

  useEffect(() => {
    listSnippets({ q: q || undefined, tag: tag || undefined, language: lang || undefined })
      .then((res: any) => { snippets.value = res.items; totalCount.value = res.total; })
      .catch(() => showToast('Failed to load snippets', 'err'));
  }, [q, tag, lang]);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      showToast('Copy failed', 'err');
    }
  }

  async function handleDelete(e: Event, id: string) {
    e.stopPropagation();
    if (!confirm('Delete this snippet?')) return;
    try {
      await deleteSnippet(id);
      snippets.value = snippets.value.filter(s => s.id !== id);
      showToast('Deleted');
    } catch {
      showToast('Delete failed', 'err');
    }
  }

  function langLabel(l: string) {
    if (!l) return null;
    const idx = LANGUAGES.indexOf(l.toLowerCase());
    return idx >= 0 ? LANGUAGES[idx] : l;
  }

  function preview(code: string) {
    return code.length > 160 ? code.slice(0, 160).replace(/\n/g, ' ') + '…' : code.replace(/\n/g, ' ');
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Search bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text3)', fontSize: 14,
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search snippets by title, language, or code…"
            value={q}
            onInput={(e: any) => searchQuery.value = e.target.value}
            style={{ width: '100%', paddingLeft: 38, fontFamily: 'var(--font-body)' }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>{ }</div>
          <p style={{ fontSize: 16, marginBottom: 8 }}>
            {q || tag || lang ? 'No matching snippets.' : 'No snippets yet.'}
          </p>
          {!q && !tag && !lang && (
            <button
              onClick={() => navigate('/new')}
              style={{ color: 'var(--accent2)', fontSize: 14, cursor: 'pointer' }}
            >
              Create your first snippet
            </button>
          )}
        </div>
      ) : (
        /* Card grid — responsive 1/2/3 columns */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {items.map((s: any) => (
            <div key={s.id} style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid var(--border-subtle)`,
              overflow: 'hidden', cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              display: 'flex', flexDirection: 'column',
            }} onClick={() => navigate(`/edit/${s.id}`)}>
              {/* Card header: title + language badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 14px 10px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 15, fontWeight: 600, flex: 1, minWidth: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {s.title}
                </span>
                {s.language ? (
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.04em', color: 'var(--accent)',
                    background: 'var(--accent-ghost)', padding: '2px 8px',
                    borderRadius: 4, flexShrink: 0,
                  }}>
                    {langLabel(s.language)}
                  </span>
                ) : null}
              </div>

              {/* Code preview */}
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.55,
                color: 'var(--text3)', background: 'var(--bg)',
                padding: '8px 14px', flex: 1,
                overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
              }}>
                {preview(s.content)}
              </div>

              {/* Card footer: tags + actions */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderTop: `1px solid var(--border-subtle)`,
              }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                  {s.tags.length > 0 ? (
                    s.tags.slice(0, 3).map((t: string) => (
                      <span key={t} style={{
                        fontSize: 10, color: 'var(--text3)',
                        background: 'var(--surface-hover)', padding: '2px 7px',
                        borderRadius: 4, cursor: 'pointer',
                      }} onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        activeTag.value = t;
                      }}>
                        {t}
                      </span>
                    ))
                  ) : null}
                  {s.tags.length > 3 ? (
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>+{s.tags.length - 3}</span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={(e: MouseEvent) => { e.stopPropagation(); copyToClipboard(s.content); }}
                    style={cardAction} title="Copy"
                  >📋</button>
                  <button
                    onClick={(e: any) => handleDelete(e, s.id)}
                    style={{ ...cardAction, color: 'var(--red)' }} title="Delete"
                  >🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardAction: any = {
  padding: '4px 6px', borderRadius: 'var(--radius)',
  fontSize: 13, lineHeight: 1, cursor: 'pointer',
  transition: 'background 0.15s',
};
