#!/usr/bin/env node
/**
 * Regenerates src/data/networkStats.json: counts of Malaysian nodes heard
 * by the MeshMY MQTT server, for the homepage.
 *
 *   npm run stats                 # fetch the live node list
 *   npm run stats -- nodes.json   # or read a saved dump
 *
 * Only aggregate counts are written. The node list holds names and
 * positions, so never commit a raw dump.
 */
import {readFile, writeFile} from 'node:fs/promises';

const API = 'https://meshmap2.lucifernet.com/api/v1/nodes';
const OUT = new URL('../src/data/networkStats.json', import.meta.url);

// The server's history starts here: nodes first seen this month include
// everyone who was already on the mesh, so it isn't "new".
const HISTORY_STARTS = '2025-12';

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
  SEEED_WIO_TRACKER_L1: 'Seeed Wio Tracker L1',
  TRACKER_T1000_E: 'Seeed SenseCAP T1000-E',
  NRF52_PROMICRO_DIY: 'nRF52 Pro Micro (DIY)',
  T_DECK: 'LilyGO T-Deck',
  TBEAM: 'LilyGO T-Beam',
  T_ECHO: 'LilyGO T-Echo',
};
const TOP_HARDWARE = 6;
const OTHER_HARDWARE = 'Other models';

const isMalaysianRegion = (n) => /^MY_/.test(n.region_name || '');

function position(n) {
  if (n.latitude == null || n.longitude == null) return null;
  return [n.latitude / 1e7, n.longitude / 1e7];
}

/** In Malaysia by position; by region setting for nodes that share no position. */
function inMalaysia(n) {
  const p = position(n);
  if (!p) return isMalaysianRegion(n);
  if (!inBox(...p, MALAYSIA) || inBox(...p, SUMATRA)) return false;
  // Johor Bahru and Singapore sit either side of the strait: trust the region there.
  if (inBox(...p, SINGAPORE)) return isMalaysianRegion(n);
  return true;
}

function areaOf(n) {
  const p = position(n);
  if (!p) return null;
  return AREAS.find(([, box]) => inBox(...p, box))?.[0] ?? OTHER_AREA;
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

function previousMonth(isoDate) {
  const d = new Date(`${isoDate.slice(0, 7)}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}

async function load(file) {
  if (file) return JSON.parse(await readFile(file, 'utf8'));
  const res = await fetch(API);
  if (!res.ok) throw new Error(`${API}: HTTP ${res.status}`);
  return res.json();
}

const {nodes} = await load(process.argv[2]);
if (!Array.isArray(nodes)) throw new Error('Expected {nodes: [...]}');

const my = nodes.filter(inMalaysia);
if (my.length < MIN_NODES) {
  throw new Error(`Only ${my.length} Malaysian nodes: not writing stats.`);
}
// The latest update in the data (so a saved dump gets its own date), as a
// Malaysian (UTC+8) date.
const latest = nodes.reduce((max, n) => (n.updated_at > max ? n.updated_at : max), '');
const latestMs = Date.parse(latest);
if (Number.isNaN(latestMs)) throw new Error('No valid updated_at in the data.');
const asOf = new Date(latestMs + 8 * 3600e3).toISOString().slice(0, 10);
const month = previousMonth(asOf);

const stats = {
  source: API,
  asOf,
  since: HISTORY_STARTS,
  nodes: my.length,
  newInMonth: {
    month,
    count: month > HISTORY_STARTS ? my.filter((n) => n.created_at?.startsWith(month)).length : null,
  },
  byType: tally(my, typeOf, OTHER_TYPE),
  byArea: tally(my, areaOf, OTHER_AREA),
  byHardware: byHardware(my),
  noPosition: my.filter((n) => !position(n)).length,
};

await writeFile(OUT, `${JSON.stringify(stats, null, 2)}\n`);
console.log(`Wrote ${OUT.pathname}: ${stats.nodes} Malaysian nodes as of ${asOf}.`);
