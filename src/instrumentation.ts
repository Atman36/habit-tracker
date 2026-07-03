/**
 * Node.js >= 22 exposes an experimental global `localStorage` whose methods are
 * not implemented (e.g. `localStorage.getItem` is `undefined`). During SSR in
 * `next dev`, Next.js's own dev-tools overlay initialises state with guards like
 * `typeof localStorage !== 'undefined' && localStorage.getItem(...)`. That guard
 * wrongly passes on the server (the stub is an object), then the call throws
 * `localStorage.getItem is not a function`, crashing the render with HTTP 500.
 *
 * `localStorage` is a browser-only API and must not exist on the server, so we
 * remove the bogus global here (runs once per server process, before any
 * request is rendered). Client bundles are unaffected — this only runs on Node.
 */
export function register() {
  if (typeof window === 'undefined') {
    try {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } catch {
      // If the property is non-configurable, fall back to shadowing it.
      try {
        Object.defineProperty(globalThis, 'localStorage', {
          value: undefined,
          configurable: true,
        });
      } catch {
        /* give up silently */
      }
    }
  }
}
