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
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // Keep the bubble inside the viewport on narrow screens.
  useIsoLayoutEffect(() => {
    if (!open || !tip.current) return;
    const r = tip.current.getBoundingClientRect();
    const margin = 8;
    const over = r.right - (document.documentElement.clientWidth - margin);
    const under = margin - r.left;
    setShift((s) => s + (over > 0 ? -over : under > 0 ? under : 0));
  }, [open]);

  if (!entry) return children;
  return (
    <span className={styles.term} ref={root}>
      <button
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => {
          setShift(0);
          setOpen((o) => !o);
        }}>
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
