import { signal } from '@preact/signals';
import { useEffect, useCallback } from 'preact/hooks';

export interface RouteMatch {
  pattern: string;
  params: Record<string, string>;
}

type RouteHandler = (match: RouteMatch) => void;

const routes: { pattern: RegExp; keys: string[]; handler: RouteHandler }[] = [];

export const currentPath = signal(window.location.hash.slice(1) || '/');

function initRouter() {
  const onHash = () => {
    currentPath.value = window.location.hash.slice(1) || '/';
  };
  window.addEventListener('hashchange', onHash);
  onHash();
}

export function route(pattern: string, handler: RouteHandler) {
  const keys: string[] = [];
  const regex = new RegExp(
    '^' + pattern.replace(/:([^/]+)/g, (_: string, key: string) => {
      keys.push(key);
      return '([^/]+)';
    }) + '$'
  );
  routes.push({ pattern: regex, keys, handler });
}

export function navigate(path: string) {
  window.location.hash = `#${path}`;
}

export function matchRoute(path: string): RouteMatch | null {
  for (const { pattern, keys } of routes) {
    const m = path.match(pattern);
    if (m) {
      const params: Record<string, string> = {};
      keys.forEach((k, i) => { params[k] = m[i + 1]; });
      return { pattern: pattern.source, params };
    }
  }
  return null;
}

export function useRouter() {
  const match = useCallback((path: string) => matchRoute(path), []);

  useEffect(() => {
    initRouter();
  }, []);

  return { currentPath, match, navigate };
}

// For use in app.tsx view dispatch
export function pathStartsWith(prefix: string): boolean {
  return currentPath.value.startsWith(prefix);
}
