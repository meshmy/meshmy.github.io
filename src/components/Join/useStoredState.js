import {useCallback, useEffect, useState} from 'react';

/**
 * Like useState, but remembered in localStorage under `key`.
 *
 * The first render always uses `initial`, matching the build-time HTML, and
 * the saved value is read after mount, so hydration never mismatches.
 * Saved values are shallow-merged over `initial`, so new fields get their
 * defaults. Storage errors (private mode, quota) are ignored.
 *
 * Returns [value, update, reset]. `update` takes a partial object or a
 * function of the previous value.
 */
export default function useStoredState(key, initial) {
  const [value, setValue] = useState(initial);
  // State, not a ref: the first save must wait for the render that has the
  // loaded value, or it would write `initial` over the saved data.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        setValue((v) => merge(v, saved));
      }
    } catch {
      // Unreadable or invalid: keep the defaults.
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Not persisted; the page still works.
    }
  }, [key, value, loaded]);

  const update = useCallback(
    (patch) => setValue((v) => merge(v, typeof patch === 'function' ? patch(v) : patch)),
    [],
  );
  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, update, reset];
}

// One level deep: nested objects (e.g. answers, done) are merged too.
function merge(base, patch) {
  const out = {...base};
  for (const [k, v] of Object.entries(patch || {})) {
    out[k] =
      v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object'
        ? {...base[k], ...v}
        : v;
  }
  return out;
}
