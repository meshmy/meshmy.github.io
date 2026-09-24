import {useState, useRef, useEffect} from 'react';
import clsx from 'clsx';
import styles from './CopyButton.module.css';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / insecure contexts.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Small "Copy" button; announces success to screen readers. */
export default function CopyButton({text, label = 'Copy', className, variant = 'ghost'}) {
  const [state, setState] = useState('idle');
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1800);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(styles.copy, styles[variant], state === 'copied' && styles.copied, className)}
      aria-label={state === 'idle' ? `${label}: ${text}` : undefined}>
      <span aria-hidden="true" className={styles.icon}>
        {state === 'copied' ? (
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14"><rect x="5" y="5" width="8.5" height="8.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10.5 3.5v-.5A1.5 1.5 0 009 1.5H3A1.5 1.5 0 001.5 3v6A1.5 1.5 0 003 10.5h.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        )}
      </span>
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : label}
      </span>
    </button>
  );
}
