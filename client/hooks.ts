import { useState, useEffect, useRef } from 'preact/hooks';
import type { ReadonlySignal } from '@preact/signals';

/**
 * Subscribe a component to a signal.
 * Uses setInterval polling (guaranteed to work regardless of bundler).
 * Also reads the signal during render so auto-tracking can kick in if available.
 */
export function useSignalValue<T>(sig: ReadonlySignal<T>): T {
  const sigRef = useRef(sig);
  sigRef.current = sig;
  const [, forceUpdate] = useState(0);

  // Poll every 100ms — brute force but 100% reliable
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 100);
    return () => clearInterval(id);
  }, []);

  // Read during render so @preact/signals auto-tracking subscribes if active
  return sigRef.current.value;
}
