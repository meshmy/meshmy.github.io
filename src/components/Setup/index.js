import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CopyButton from '@site/src/components/Home/CopyButton';
import ConfigQr from '@site/src/components/Home/ConfigQr';
import styles from './styles.module.css';

/**
 * Shared building blocks for "get on the mesh" UI (homepage and Join).
 */

/** A labelled setting value, with an optional copy button. Use inside <Settings>. */
export function SettingRow({label, value, hint, copy}) {
  return (
    <div className={styles.setting}>
      <dt>{label}</dt>
      <dd>
        <span>
          <code>{value}</code>
          {hint && <small>{hint}</small>}
        </span>
        {copy && <CopyButton text={copy === true ? value : copy} />}
      </dd>
    </div>
  );
}

export function Settings({children, className}) {
  return <dl className={clsx(styles.settings, className)}>{children}</dl>;
}

/**
 * A link that leads into Meshtastic: their green, and (as a button) their
 * official logo. Only for meshtastic.org config links and the app stores.
 */
export function MeshtasticLink({href, children, pill = false, logo = !pill, external = false, className}) {
  const logoUrl = useBaseUrl('/img/meshtastic/Mesh_Logo_Black.svg');
  return (
    <a
      className={clsx(!pill && 'button', styles.mt, pill && styles.mtPill, className)}
      href={href}
      {...(external ? {target: '_blank', rel: 'noreferrer'} : {})}>
      {logo && <img src={logoUrl} alt="" width="26" height="14" />}
      {children}
    </a>
  );
}

/**
 * A question answered with pill-shaped radio buttons. Native inputs in a
 * fieldset, so it works by keyboard (arrow keys) and screen reader.
 */
export function Choice({name, label, options, value, onChange, className}) {
  // `className` goes on a wrapper, so page spacing never competes with the
  // fieldset's own reset across separately loaded CSS files.
  return (
    <div className={className}>
      <fieldset className={styles.choice}>
        <legend>{label}</legend>
        <div className={styles.pills}>
          {options.map((o) => (
            <label key={o.value} className={styles.pill}>
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={value === o.value}
                onChange={() => onChange(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/**
 * The one-tap config: QR code, "Open in Meshtastic", "Copy link", and
 * whatever settings the caller lists as children.
 */
export function ConfigCard({url, qrTitle, intro, children}) {
  return (
    <div className={styles.configCard}>
      <div className={styles.qr}>
        <ConfigQr value={url} title={qrTitle} />
        <small>Scan in the Meshtastic app</small>
      </div>
      <div className={styles.configBody}>
        {intro}
        <div className={styles.configActions}>
          <MeshtasticLink href={url}>Open in Meshtastic</MeshtasticLink>
          <CopyButton text={url} label="Copy link" variant="solid" />
        </div>
        {children}
      </div>
    </div>
  );
}
