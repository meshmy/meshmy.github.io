import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {weeklyNet} from '@site/src/data/meshtasticConfig';
import {mytTime, netStatus, relative} from './netSchedule';
import styles from './NetStatus.module.css';

/**
 * "Open now" / "Next net" pill, in Malaysia time. The current time isn't
 * known at build time, so the server render (and the first client render)
 * shows the plain schedule; the live status replaces it after mount and
 * refreshes every 30 seconds. Deliberately not a live region: the minute
 * countdown would be re-announced to screen readers every minute.
 */
export default function NetStatus() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30e3);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <p className={styles.status}>
        <span className={clsx(styles.mark, styles.closed)} aria-hidden="true" />
        <span>
          Every {weeklyNet.day}, {weeklyNet.hours} (Malaysia time)
        </span>
      </p>
    );
  }
  const s = netStatus(now);
  return (
    <p className={clsx(styles.status, s.open && styles.isOpen)}>
      <span className={clsx(styles.mark, s.open ? styles.open : styles.closed)} aria-hidden="true" />
      {/* One span, so the flex gap only sits between the mark and the text. */}
      <span>
        {s.open ? (
          <>
            <strong>Open now</strong> · closes {mytTime(s.closesAt, false)} ({relative(s.closesAt, now)})
          </>
        ) : (
          <>
            <strong>Next net</strong> · {mytTime(s.opensAt)} ({relative(s.opensAt, now)})
          </>
        )}
      </span>
    </p>
  );
}
