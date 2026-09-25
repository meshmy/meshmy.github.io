#!/usr/bin/env node
/**
 * Regenerates src/data/networkStats.json: counts of Malaysian nodes heard
 * by the MeshMY MQTT server, for the homepage. Then checks each router
 * band's `nodeId` in src/data/sites.js against when the node was last
 * heard, so a hand-set status that's out of date shows up.
 *
 *   npm run stats                 # fetch from the API
 *   npm run stats -- nodes.json   # or read a node list saved from the same API (no router check)
 *
 * The API (https://api.lucifernet.com/meshtastic/) signs every request:
 * put MESHAPI_KEY and MESHAPI_SECRET in the git-ignored .env.local (see
 * .env.example). It keeps 90 days of history, so the stats are windows
 * ending at the latest report in the data.
 *
 * Only aggregate counts are written, and the router check is printed, not
 * saved. The node list holds names and positions, so never commit a raw dump.
 */
import {createHash, createHmac, randomBytes} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {sites} from '../src/data/sites.js';

const API = 'https://api.lucifernet.com';
const BASE = '/meshtastic/v1';
const OUT = new URL('../src/data/networkStats.json', import.meta.url);
const ENV_FILE = new URL('../.env.local', import.meta.url);

const DAY = 864e5;
const HOUR = 36e5;
// Windows ending on the day of the snapshot. The longer one is the headline
// and the window for the breakdowns.
const WINDOW = 30;
const SHORT_WINDOW = 7;
// Months of "new nodes" to show, the current month included.
const NEW_MONTHS = 6;
// The server's history starts here: nodes first seen this month include
// everyone who was already on the mesh, so it isn't "new".
const HISTORY_STARTS = '2025-12';
// A healthy router reports at least every ~9 h; quieter than this is worth a look.
const QUIET_HOURS = 24;

const inBox = (lat, lon, [s, n, w, e]) => lat >= s && lat <= n && lon >= w && lon <= e;
const MALAYSIA = [0.85, 7.5, 99.5, 119.5];
// Inside MALAYSIA but across the Strait of Malacca, in Sumatra.
const SUMATRA = [0.85, 1.6, 99.5, 102.9];
const SINGAPORE = [0.85, 1.455, 103.6, 104.1];
// A healthy snapshot has hundreds; far fewer means the data or filter broke.
const MIN_NODES = 50;

// Rough areas, checked in order. Hand-drawn boxes, so the split is approximate.
const AREAS = [
  ['Sabah', [3.9, 7.5, 115.3, 119.5]],
  ['Sarawak', [0.85, 5.1, 109.5, 115.3]],
  ['Penang', [5.1, 5.6, 100.1, 100.54]],
  ['Kedah & Perlis', [5.1, 6.8, 99.5, 101.0]],
  ['Klang Valley', [2.75, 3.5, 101.2, 101.95]],
  ['Negeri Sembilan & Melaka', [2.0, 2.95, 101.5, 102.6]],
  ['Johor', [0.85, 2.6, 102.5, 104.5]],
  ['Perak', [3.6, 5.1, 100.3, 101.5]],
];
const OTHER_AREA = 'Elsewhere';

const TYPES = [
  ['Clients', /^CLIENT/],
  ['Routers', /^ROUTER/],
  ['Trackers', /TRACKER$/],
];
const OTHER_TYPE = 'Other';

// Readable names for the most common models; the rest are grouped.
const HARDWARE = {
  HELTEC_V3: 'Heltec V3',
  HELTEC_V4: 'Heltec V4',
  HELTEC_WSL_V3: 'Heltec Wireless Stick Lite V3',
  HELTEC_MESH_NODE_T114: 'Heltec T114',
  HELTEC_WIRELESS_TRACKER: 'Heltec Wireless Tracker',
  RAK4631: 'RAK WisBlock RAK4631',
  SEEED_SOLAR_NODE: 'Seeed SenseCAP Solar Node P1',
  SEEED_WIO_TRACKER_L1: 'Seeed Wio Tracker L1',
  TRACKER_T1000_E: 'Seeed SenseCAP T1000-E',
  NRF52_PROMICRO_DIY: 'nRF52 Pro Micro (DIY)',
  T_DECK: 'LilyGO T-Deck',
  TBEAM: 'LilyGO T-Beam',
  T_ECHO: 'LilyGO T-Echo',
};
const TOP_HARDWARE = 6;
const OTHER_HARDWARE = 'Other models';

// RFC 3986: encodeURIComponent leaves !'()* alone, the API expects them encoded.
const encode = (s) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const EMPTY_BODY = createHash('sha256').update('').digest('hex');

function credentials() {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err;
  }
  const {MESHAPI_KEY: key, MESHAPI_SECRET: secret} = process.env;
  if (!key || !secret) {
    console.error(
      'MESHAPI_KEY and MESHAPI_SECRET are not set. Add them to .env.local (see .env.example).\n' +
        'src/data/networkStats.json is unchanged.',
    );
    process.exit(1);
  }
  return {key, secret};
}

/** A signed GET. Returns the parsed body, or null for a 404. */
async function get({key, secret}, path, params = {}) {
  // Sorted by name, then value, as the signature requires.
  const query = Object.entries(params)
    .map(([k, v]) => [encode(k), encode(String(v))])
    .sort(([a, x], [b, y]) => (a < b ? -1 : a > b ? 1 : x < y ? -1 : x > y ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const fullPath = `${BASE}${path}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomBytes(16).toString('hex');
  const signature = createHmac('sha256', secret)
    .update(['HMAC-SHA256', 'GET', fullPath, query, timestamp, nonce, EMPTY_BODY].join('\n'))
    .digest('hex');
  const url = `${API}${fullPath}${query ? `?${query}` : ''}`;
  const res = await fetch(url, {
    headers: {'X-Api-Key': key, 'X-Timestamp': timestamp, 'X-Nonce': nonce, 'X-Signature': signature},
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${fullPath}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

/** Every page of a list endpoint. */
async function getAll(creds, path, params) {
  const out = [];
  const seen = new Set();
  let cursor;
  do {
    const page = await get(creds, path, {...params, limit: 1000, ...(cursor ? {cursor} : {})});
    if (!Array.isArray(page?.data)) throw new Error(`${path}: no list in the response`);
    out.push(...page.data);
    seen.add(cursor);
    cursor = page.page?.next_cursor;
    if (cursor && seen.has(cursor)) throw new Error(`${path}: the same page cursor came back twice`);
  } while (cursor);
  return out;
}

function position(n) {
  const {latitude, longitude} = n.position ?? {};
  if (latitude == null || longitude == null) return null;
  return [latitude, longitude];
}

/** In Malaysia by position. Nodes that share no position can't be placed. */
function inMalaysia(n) {
  const p = position(n);
  if (!p || !inBox(...p, MALAYSIA) || inBox(...p, SUMATRA)) return false;
  // Johor Bahru and Singapore sit either side of the strait: trust the region there.
  if (inBox(...p, SINGAPORE)) return /^MY_/.test(n.region_name || '');
  return true;
}

function areaOf(n) {
  return AREAS.find(([, box]) => inBox(...position(n), box))?.[0] ?? OTHER_AREA;
}

function typeOf(n) {
  return TYPES.find(([, re]) => re.test(n.role_name || ''))?.[0] ?? OTHER_TYPE;
}

/** [[label, count], …] largest first, with `last` (if present) kept at the end. */
function tally(nodes, fn, last) {
  const counts = new Map();
  for (const n of nodes) {
    const k = fn(n);
    if (k != null) counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts]
    .sort((a, b) => (a[0] === last) - (b[0] === last) || b[1] - a[1])
    .map(([label, count]) => ({label, count}));
}

/** The TOP_HARDWARE most common named models, then everything else. */
function byHardware(nodes) {
  const all = tally(nodes, (n) => n.hardware_model_name || 'UNSET');
  const named = all.filter((r) => HARDWARE[r.label]).slice(0, TOP_HARDWARE);
  const other = nodes.length - named.reduce((sum, r) => sum + r.count, 0);
  return [
    ...named.map((r) => ({label: HARDWARE[r.label], count: r.count})),
    {label: OTHER_HARDWARE, count: other},
  ];
}

/** A timestamp as a Malaysian (UTC+8) date, "2026-09-25". */
const mytDate = (ms) => new Date(ms + 8 * HOUR).toISOString().slice(0, 10);

/** The last `count` months up to and including `isoDate`'s, oldest first. */
function monthsTo(isoDate, count) {
  const d = new Date(`${isoDate.slice(0, 7)}-01T00:00:00Z`);
  const months = [];
  for (let i = 0; i < count; i++) {
    months.unshift(d.toISOString().slice(0, 7));
    d.setUTCMonth(d.getUTCMonth() - 1);
  }
  return months;
}

/** New nodes per month, counted from `first_seen_at` in Malaysian time. */
function newByMonth(nodes, asOf) {
  return monthsTo(asOf, NEW_MONTHS)
    .filter((month) => month > HISTORY_STARTS)
    .map((month) => ({
      month,
      count: nodes.filter((n) => n.first_seen_at && mytDate(Date.parse(n.first_seen_at)).startsWith(month))
        .length,
    }));
}

const hoursAgo = (iso, now) => (now - Date.parse(iso)) / HOUR;

function formatHours(h) {
  return h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`;
}

/** Prints each router band's hand-set status next to when its node was last heard. */
async function checkRouters(creds, now) {
  const rows = [];
  for (const site of sites) {
    for (const band of site.bands) {
      const status = band.status || 'active';
      const label = `${site.shortName} ${band.freq}`;
      if (!band.nodeId) {
        if (status !== 'decommissioned') rows.push([label, status, '–', 'no nodeId in sites.js']);
        continue;
      }
      const node = (await get(creds, `/nodes/${band.nodeId}`))?.data;
      const h = node?.last_seen_at ? hoursAgo(node.last_seen_at, now) : null;
      const heard = h == null ? 'not heard in 90 days' : `heard ${formatHours(h)} ago`;
      let note = '';
      if (status === 'active' && (h == null || h > QUIET_HOURS)) note = `CHECK: quiet for over ${QUIET_HOURS} h`;
      if (status !== 'active' && h != null && h <= QUIET_HOURS) note = 'CHECK: heard recently, back on air?';
      rows.push([label, status, `${band.nodeId} ${heard}`, note]);
    }
  }
  const widths = [0, 1, 2].map((i) => Math.max(...rows.map((r) => r[i].length)));
  console.log('\nRouter check (status in sites.js, when the node was last heard):');
  for (const r of rows) {
    console.log(`  ${r.map((c, i) => (i < 3 ? c.padEnd(widths[i]) : c)).join('  ')}`.trimEnd());
  }
  const checks = rows.filter((r) => r[3].startsWith('CHECK')).length;
  console.log(checks ? `\n${checks} to check: update status in src/data/sites.js if needed.` : '\nAll as expected.');
}

const file = process.argv[2];
const creds = file ? null : credentials();
const now = Date.now();

let nodes;
if (file) {
  const dump = JSON.parse(await readFile(file, 'utf8'));
  nodes = Array.isArray(dump) ? dump : dump.data;
} else {
  const [s, n, w, e] = MALAYSIA;
  nodes = await getAll(creds, '/nodes', {bbox: [w, s, e, n].join(',')});
}
if (!Array.isArray(nodes)) throw new Error('Expected a node list, or {data: [...]}');

// The latest report in the data, so a saved list gets its own date.
const latest = Math.max(...nodes.map((n) => Date.parse(n.last_seen_at)).filter(Number.isFinite));
if (!Number.isFinite(latest)) throw new Error('No valid last_seen_at in the data.');
const asOf = mytDate(latest);

const my = nodes.filter(inMalaysia);
const heardWithin = (days) => my.filter((n) => Date.parse(n.last_seen_at) > latest - days * DAY);
const active = heardWithin(WINDOW);
if (active.length < MIN_NODES) {
  throw new Error(`Only ${active.length} Malaysian nodes in ${WINDOW} days: not writing stats.`);
}

const stats = {
  source: `${API}/meshtastic/`,
  asOf,
  active: {days: WINDOW, count: active.length},
  activeShort: {days: SHORT_WINDOW, count: heardWithin(SHORT_WINDOW).length},
  // From every node the API still holds (90 days), so a month only counts
  // the nodes that are still around.
  newByMonth: newByMonth(my, asOf),
  byType: tally(active, typeOf, OTHER_TYPE),
  byArea: tally(active, areaOf, OTHER_AREA),
  byHardware: byHardware(active),
};

await writeFile(OUT, `${JSON.stringify(stats, null, 2)}\n`);
console.log(
  `Wrote src/data/networkStats.json: ${stats.active.count} Malaysian nodes active in the ` +
    `${WINDOW} days to ${asOf}.`,
);

if (creds) await checkRouters(creds, now);
