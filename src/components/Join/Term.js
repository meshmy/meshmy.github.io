import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {glossary} from '@site/src/data/joinGuide';
import styles from './Term.module.css';

// useLayoutEffect warns during the build's server render; it's a no-op there.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * A glossary term: a dotted-underlined button that toggles a one-line
 * definition. Works by tap, click and keyboard (Escape closes). The
 * definition goes into a live region, so screen readers announce it.
 */
export default function Term({id, children}) {
  const entry = glossary[id];
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const root = useRef(null);
  const tip = useRef(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false);
    const onFocus = (e) => !root.current?.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('focusin', onFocus);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  // Keep the bubble inside the viewport on narrow screens: work out where
  // it would sit unshifted, then nudge it in. Re-run on resize (rotation,
  // and mobile browsers resize as the address bar hides while scrolling).
  const applied = useRef(0);
  applied.current = shift;
  function place() {
    const el = tip.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = r.left - applied.current;
    const right = r.right - applied.current;
    const margin = 8;
    const over = right - (document.documentElement.clientWidth - margin);
    const under = margin - left;
    setShift(over > 0 ? -over : under > 0 ? under : 0);
  }
  useIsoLayoutEffect(() => {
    if (open) place();
  }, [open]);

  if (!entry) return children;
  return (
    <span className={styles.term} ref={root}>
      <button
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => setOpen((o) => !o)}>
        {children ?? entry.term}
      </button>
      <span
        id={tipId}
        ref={tip}
        role="status"
        className={styles.tip}
        style={shift ? {transform: `translateX(${shift}px)`} : undefined}>
        {open && (
          <>
            <strong>{entry.term}:</strong> {entry.text}
          </>
        )}
      </span>
    </span>
  );
}
