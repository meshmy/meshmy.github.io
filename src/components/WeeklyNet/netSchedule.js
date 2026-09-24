import {weeklyNet} from '@site/src/data/meshtasticConfig';

const HOUR = 3600e3;
const DAY = 24 * HOUR;

/**
 * Where `now` sits relative to the weekly net, in Malaysia time. MYT is a
 * fixed UTC+8 with no daylight saving, so plain offset arithmetic is exact
 * whatever the visitor's own time zone.
 *
 * Returns {open, closesAt} while the net is open, or {open: false, opensAt}
 * for the next one. Times are real Date instants.
 */
export function netStatus(now = new Date(), net = weeklyNet) {
  const offset = net.utcOffsetHours * HOUR;
  // "Wall clock" in MYT, expressed as a UTC date so getUTC* reads MYT fields.
  const local = new Date(now.getTime() + offset);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const daysUntil = (net.weekday - local.getUTCDay() + 7) % 7;
  const opens = midnight + daysUntil * DAY + net.opensHour * HOUR - offset;
  const closes = midnight + daysUntil * DAY + net.closesHour * HOUR - offset;

  if (daysUntil === 0 && now.getTime() >= opens && now.getTime() < closes) {
    return {open: true, closesAt: new Date(closes)};
  }
  // Today's net is over (or it's not net day): next one is today-later or next week.
  const nextOpens = now.getTime() < opens ? opens : opens + 7 * DAY;
  return {open: false, opensAt: new Date(nextOpens)};
}

/** "in 3 hours", "in 2 days", "in 45 minutes": the largest sensible unit. */
export function relative(target, now = new Date()) {
  const ms = target.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat('en-GB', {numeric: 'auto'});
  // Days from 2 days, hours from 2 hours, else minutes. If rounding lands on
  // the next unit's threshold, use that unit: 47.9 h reads "in 2 days", not
  // "in 48 hours", while 36 h stays "in 36 hours".
  if (ms >= 2 * DAY) return rtf.format(Math.round(ms / DAY), 'day');
  if (ms >= 2 * HOUR) {
    const hours = Math.round(ms / HOUR);
    return hours >= 48 ? rtf.format(2, 'day') : rtf.format(hours, 'hour');
  }
  const minutes = Math.max(1, Math.round(ms / 60e3));
  return minutes >= 120 ? rtf.format(2, 'hour') : rtf.format(minutes, 'minute');
}

/** A time as it reads in Malaysia, e.g. "Wednesday 10:00 AM". */
export function mytTime(date, withDay = true) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    ...(withDay ? {weekday: 'long'} : {}),
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace(/\b(am|pm)\b/, (m) => m.toUpperCase()); // match the site's "10:00 AM"
}
