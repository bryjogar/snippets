import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useSignalValue } from './hooks.js';
import { useRouter, navigate } from './router.js';
import { currentPath } from './router.js';
import {
  totalCount, toast, tags, languages,
  searchQuery, activeTag, activeLanguage,
  loadSidebarData,
} from './store.js';
import { getToken, setToken, listSnippets } from './api.js';
import { SnippetList } from './views/SnippetList.js';
import { EditorModal } from './views/EditorModal.js';

function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [checking, setChecking] = useState(false);
  const path = useSignalValue(currentPath);
  const toastVal = useSignalValue(toast);
  const tagList = useSignalValue(tags);
  const langList = useSignalValue(languages);
  const tag = useSignalValue(activeTag);
  const lang = useSignalValue(activeLanguage);

  // Init router — critical for hashchange listener
  useRouter();

  useEffect(() => { setSidebarOpen(false); }, [path]);

  useEffect(() => {
    if (authed) loadSidebarData();
  }, [authed]);

  async function tryUnlock() {
    const t = tokenInput.trim();
    if (!t) return;
    setChecking(true);
    setAuthError('');
    // Validate token with a real API call
    const prev = getToken();
    setToken(t);
    try {
      await listSnippets({ limit: 1 });
      setAuthed(true);
    } catch {
      setToken(prev);
      setAuthError('Invalid token — check and try again.');
    } finally {
      setChecking(false);
    }
  }

  // Auth gate
  if (!authed) {
    return (
      <div style={centerStyle}>
        <div style={authCard}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 8 }}>
            Snippets
          </h1>
          <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 14 }}>
            Enter your auth token to continue.
          </p>
          <input
            type="password"
            placeholder="Auth token..."
            value={tokenInput}
            onInput={(e: any) => { setTokenInput(e.target.value); setAuthError(''); }}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') tryUnlock();
            }}
            style={{ width: '100%', borderColor: authError ? 'var(--red)' : 'var(--border)' }}
          />
          {authError ? (
            <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{authError}</p>
          ) : null}
          <button
            onClick={tryUnlock}
            disabled={checking || !tokenInput.trim()}
            style={{ ...btnPrimary, width: '100%', marginTop: 12, opacity: checking ? 0.6 : 1 }}
          >
            {checking ? 'Verifying…' : 'Unlock'}
          </button>
        </div>
      </div>
    );
  }

  // Determine if editor is open
  const isNew = path === '/new';
  const isEdit = path.startsWith('/edit/');
  const editorOpen = isNew || isEdit;
  const editId = isEdit ? path.slice(6) : undefined;

  return (
    <div class="layout">
      <div class={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>
      {sidebarOpen && <div class="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div class="main">
        <div class="header">
          <button class="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <span class="header-title">Snippets ({totalCount.value})</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/new')}
              style={{ ...btnSmall, background: 'var(--accent)', color: '#fff' }}
            >
              + New Snippet
            </button>
          </div>
        </div>
        <div class="content">
          <SnippetList />
        </div>
      </div>
      {/* Mobile nav */}
      <div class="bottom-nav" style={{ justifyContent: 'space-around', padding: '8px 0' }}>
        <button onClick={() => navigate('/')} style={navBtn}>📋 Snippets</button>
        <button onClick={() => navigate('/new')} style={navBtn}>✏️ New</button>
      </div>
      {/* Editor modal */}
      {editorOpen && <EditorModal id={editId} isNew={isNew} />}
      {/* Toast */}
      {toastVal ? (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: toastVal.kind === 'err' ? 'var(--red)' : 'var(--green)',
          color: '#fff', padding: '8px 20px', borderRadius: 'var(--radius-lg)',
          fontSize: 14, fontWeight: 500, zIndex: 200, boxShadow: 'var(--shadow)',
        }}>
          {toastVal.message}
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }: any) {
  const tagList = useSignalValue(tags);
  const langList = useSignalValue(languages);
  const tag = useSignalValue(activeTag);
  const lang = useSignalValue(activeLanguage);

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Snippets
      </div>

      <div style={sidebarLabel}>Tags</div>
      <button
        onClick={() => { activeTag.value = ''; activeLanguage.value = ''; searchQuery.value = ''; navigate('/'); setSidebarOpen(false); }}
        style={{ ...sidebarItem, fontWeight: !tag ? 600 : 400, color: !tag ? 'var(--accent)' : 'var(--text2)' }}
      >
        All
      </button>
      {tagList.map((t: string) => (
        <button
          key={t}
          onClick={() => { activeTag.value = t; activeLanguage.value = ''; searchQuery.value = ''; navigate('/'); setSidebarOpen(false); }}
          style={{ ...sidebarItem, fontWeight: tag === t ? 600 : 400, color: tag === t ? 'var(--accent)' : 'var(--text2)' }}
        >
          {t}
        </button>
      ))}

      <div style={{ ...sidebarLabel, marginTop: 12 }}>Languages</div>
      {langList.map((l: string) => (
        <button
          key={l}
          onClick={() => { activeLanguage.value = l; activeTag.value = ''; searchQuery.value = ''; navigate('/'); setSidebarOpen(false); }}
          style={{ ...sidebarItem, fontWeight: lang === l ? 600 : 400, color: lang === l ? 'var(--accent)' : 'var(--text2)' }}
        >
          {l}
        </button>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: `1px solid var(--border-subtle)` }}>
        <button
          onClick={() => { setToken(''); window.location.reload(); }}
          style={{ ...sidebarItem, color: 'var(--text3)', fontSize: 13 }}
        >
          Lock
        </button>
      </div>
    </div>
  );
}

// ── Styles ──
const centerStyle: any = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', height: '100%',
};

const authCard: any = {
  background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow)', maxWidth: 380, width: '100%',
};

const sidebarLabel: any = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--text3)',
};

const sidebarItem: any = {
  textAlign: 'left', fontSize: 14, padding: '4px 8px',
  borderRadius: 'var(--radius)', cursor: 'pointer', wordBreak: 'break-word',
  transition: 'background 0.15s',
};

const btnPrimary: any = {
  padding: '10px 20px', borderRadius: 'var(--radius)',
  background: 'var(--accent)', color: '#fff',
  fontWeight: 500, fontSize: 15,
};

const btnSmall: any = {
  padding: '6px 16px', borderRadius: 'var(--radius)',
  fontWeight: 500, fontSize: 14,
};

const navBtn: any = {
  flex: 1, textAlign: 'center', fontWeight: 500,
  fontSize: 13, color: 'var(--text2)', padding: '6px 0',
};

render(<App />, document.getElementById('app')!);
