import {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './foliage-calculator.module.css';

Chart.register(LineController, LineElement, PointElement, LinearScale, Filler, Tooltip, Legend);

/* =========================================================================
   Meshtastic LoRa modem presets
   Link budget assumes 22 dBm TX power and 0 dBi antennas (Semtech LoRa
   calculator, per meshtastic.org/docs/overview/radio-settings/#presets).
   RX sensitivity is back-derived as 22dBm - linkBudget.
   ========================================================================= */
const PRESETS = [
  {key: 'shortTurbo', name: 'Short Turbo', bw: 500, sf: 7, cr: '4/5', bitrate: 21.88, linkBudget: 140},
  {key: 'shortFast', name: 'Short Fast', bw: 250, sf: 7, cr: '4/5', bitrate: 10.94, linkBudget: 143},
  {key: 'shortSlow', name: 'Short Slow', bw: 250, sf: 8, cr: '4/5', bitrate: 6.25, linkBudget: 145.5},
  {key: 'mediumFast', name: 'Medium Fast', bw: 250, sf: 9, cr: '4/5', bitrate: 3.52, linkBudget: 148, default: true},
  {key: 'mediumSlow', name: 'Medium Slow', bw: 250, sf: 10, cr: '4/5', bitrate: 1.95, linkBudget: 150.5},
  {key: 'longTurbo', name: 'Long Turbo', bw: 500, sf: 11, cr: '4/8', bitrate: 1.34, linkBudget: 150},
  {key: 'longFast', name: 'Long Fast', bw: 250, sf: 11, cr: '4/5', bitrate: 1.07, linkBudget: 153},
  {key: 'longModerate', name: 'Long Moderate', bw: 125, sf: 11, cr: '4/8', bitrate: 0.34, linkBudget: 156},
  {key: 'longSlow', name: 'Long Slow', bw: 125, sf: 12, cr: '4/8', bitrate: 0.18, linkBudget: 158.5},
];

const ASSUMED_TX_DBM = 22; // baseline the Meshtastic link budgets are computed against

// Suggested density multiplier for dense tropical rainforest. Weissberger's original
// coefficients were fit to temperate mixed deciduous/coniferous woodland; measurements through
// dense, multi-layer tropical canopy (higher leaf area index and moisture content) generally
// show excess vegetation attenuation on the order of 1.5-2x that baseline, so 1.8x is used as
// a representative point within the slider's 0.5-2x range.
const TROPICAL_DENSITY = 1.8;
const TROPICAL_SLIDER_POS = Math.log2(TROPICAL_DENSITY);

// Native range thumbs are inset by half their own width at each end of the track, so a naive
// `left: X%` (measured against the full element width) lands slightly off from where the thumb
// actually sits at that value. THUMB_WIDTH lets the tropical marker match the thumb's own
// pixel offset; it must match the .slider thumb width in foliage-calculator.module.css.
const THUMB_WIDTH = 16;

// Link margin preset shortcuts, mirroring the single "Tropical" density
// marker below but generalized to multiple markers on one track (see
// useTrackMarkerPositions).
const MARGIN_PRESETS = [
  {label: 'Clean', value: 10},
  {label: 'Safe', value: 20},
  {label: 'Urban', value: 30},
];
const MARGIN_MIN = 0;
const MARGIN_MAX = 30;

/* =========================================================================
   Physics
   ========================================================================= */

// Weissberger Modified Exponential Decay model. f in GHz, d (foliage depth) in metres.
// densityFactor scales the excess-attenuation coefficient: 1.0 = Weissberger's original
// mixed deciduous/coniferous baseline, 0.5 = sparser foliage, 2.0 = denser foliage.
function weissbergerLossDb(fGHz, dM, densityFactor = 1) {
  if (dM <= 0) return 0;
  // Depth is not clamped at the model's 400 m validation ceiling: the power-law curve is left
  // to extrapolate past it (flagged separately via the validity warning) rather than freezing
  // attenuation growth, which would let free-space loss alone drive the distance solution to
  // run away unbounded for generous link budgets.
  const base =
    dM <= 14
      ? 0.45 * Math.pow(fGHz, 0.284) * dM
      : 1.33 * Math.pow(fGHz, 0.284) * Math.pow(dM, 0.588);
  return base * densityFactor;
}

// Free-space path loss. f in MHz, d in metres.
function fsplDb(fMHz, dM) {
  if (dM <= 0) return 0;
  return 20 * Math.log10(dM) + 20 * Math.log10(fMHz) - 27.55;
}

function totalPathLossDb(fMHz, dM, densityFactor = 1) {
  return fsplDb(fMHz, dM) + weissbergerLossDb(fMHz / 1000, dM, densityFactor);
}

// Free-space path loss alone can "solve" for absurd distances (hundreds+ km) given a generous
// link budget, since it has no notion of Earth curvature, terrain, or Fresnel-zone clearance.
// Rather than modeling that geometry (which would need antenna height/terrain inputs this
// calculator doesn't collect), usable distance is capped at a fixed, generously-optimistic
// ceiling for what elevated, clear-line-of-sight terrestrial LoRa links actually achieve.
const PRACTICAL_MAX_RANGE_M = 100000; // 100 km

// Default headroom reserved above bare sensitivity for real-world fading, multipath, and
// imperfect alignment. Without it, solved distance is the theoretical 0-margin edge where the
// link just barely closes in perfectly ideal conditions — not the same thing as a reliable
// link. 20 dB matches the "Safe" preset shortcut below (see MARGIN_PRESETS) — a more
// conservative starting point than the bare 10 dB minimum, better suited as an out-of-the-box
// default; adjustable via the Antennas & Cabling card for deployments that want a stricter or
// more lenient reliability assumption.
const DEFAULT_LINK_MARGIN_DB = 20;

// Max allowable path loss given the full link budget chain.
function computeMapl({txPowerDbm, txGainDbi, rxGainDbi, txLossDb, rxLossDb, linkBudgetDb, marginDb}) {
  const sensitivityDbm = ASSUMED_TX_DBM - linkBudgetDb;
  return txPowerDbm + txGainDbi + rxGainDbi - txLossDb - rxLossDb - sensitivityDbm - marginDb;
}

// Binary search the largest distance whose total path loss stays within MAPL. The search
// bracket is expanded exponentially until it actually brackets the crossing point, rather than
// assuming any fixed distance is "far enough" — a free-space-only link (foliage toggled off)
// with a generous budget can be usable well beyond typical foliage-inclusive ranges.
const SOLVE_HARD_CEILING_M = 1e7; // 10,000 km — a numerical stop, not a claim of realism

function solveUsableDistance(fMHz, maplDb, densityFactor = 1) {
  if (maplDb <= 0) return 0;

  let lo = 0; // loss(0) = 0, always within budget
  let hi = 1000;
  while (totalPathLossDb(fMHz, hi, densityFactor) <= maplDb) {
    if (hi >= SOLVE_HARD_CEILING_M) return SOLVE_HARD_CEILING_M;
    hi *= 2;
  }

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (totalPathLossDb(fMHz, mid, densityFactor) <= maplDb) lo = mid;
    else hi = mid;
  }
  return lo;
}

function pctInRange(value, min, max) {
  return ((value - min) / (max - min)) * 100;
}

function sliderFillStyle(value, min, max) {
  return {'--fill': `${pctInRange(value, min, max)}%`};
}

// Default values for every persisted/resettable control, defined once so the initial
// useState calls and the "Reset to defaults" button stay in sync with a single source of
// truth.
const DEFAULTS = {
  freq: 915,
  txPower: 22,
  presetIndex: PRESETS.findIndex((p) => p.default),
  txGain: 2,
  rxGain: 2,
  margin: DEFAULT_LINK_MARGIN_DB,
  pigtailOn: true,
  txLoss: 0.5,
  rxLoss: 0.5,
  foliageOn: true,
  density: 1,
};

const STORAGE_KEY = 'meshmy-foliage-calculator-v1';

// Positions an array of marker buttons at their exact pixel offset along a
// range input's track, given each as a 0-1 fraction of the track. Corrects
// for the native thumb's own half-width inset at each end (THUMB_WIDTH) so a
// marker aligns with where the thumb actually sits at that value. Shared by
// the density slider's single "Tropical" marker and the margin slider's
// preset markers.
//
// Re-measures via ResizeObserver rather than only a window resize listener:
// a one-shot measurement on mount can race a post-mount layout shift (e.g.
// web fonts swapping in and reflowing the card grid), leaving markers
// pinned to a stale track width with nothing to trigger a recompute short
// of the user resizing their window.
function useTrackMarkerPositions(trackRef, fractions) {
  const [lefts, setLefts] = useState(() => fractions.map(() => 0));
  const key = fractions.join(',');
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return undefined;
    function position() {
      const trackWidth = node.getBoundingClientRect().width;
      setLefts(key.split(',').map((f) => THUMB_WIDTH / 2 + parseFloat(f) * (trackWidth - THUMB_WIDTH)));
    }
    if (typeof ResizeObserver === 'undefined') {
      position();
      window.addEventListener('resize', position);
      return () => window.removeEventListener('resize', position);
    }
    const observer = new ResizeObserver(position);
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return lefts;
}

// Switches the headline distance to km once it's long enough that metres stop being the
// natural unit, rather than always showing a possibly 5-6 digit metre count.
function formatDistance(m) {
  if (m >= 1000) {
    return {value: (m / 1000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), unit: 'km'};
  }
  return {value: Math.round(m).toLocaleString(), unit: 'm'};
}

// Chart.js draws to a canvas, so its colors must be resolved to concrete values rather than
// left as `var(--...)` strings (the 2D canvas API doesn't participate in the CSS cascade).
// Reading them from the page keeps the chart in sync with Infima's theme instead of
// hardcoding a second, parallel palette.
function themeColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildChart(canvas) {
  const red = themeColor('--ifm-color-primary');
  const yellow = themeColor('--ifm-color-secondary');
  const muted = themeColor('--ifm-color-emphasis-600');
  const gridLine = themeColor('--ifm-color-emphasis-300');

  return new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Total path loss',
          data: [],
          borderColor: red,
          backgroundColor: `color-mix(in srgb, ${red} 15%, transparent)`,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Max allowable path loss',
          data: [],
          borderColor: red,
          borderDash: [6, 4],
          pointRadius: 0,
          borderWidth: 1.5,
          fill: false,
        },
        {
          label: 'Usable distance',
          data: [],
          borderColor: yellow,
          borderWidth: 2,
          borderDash: [2, 3],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {duration: 650, easing: 'easeOutQuart'},
      interaction: {intersect: false, mode: 'index'},
      scales: {
        x: {
          type: 'linear',
          title: {display: true, text: 'Distance / foliage depth (m)', color: muted, font: {size: 11}},
          ticks: {color: muted, font: {size: 10}},
          grid: {color: `color-mix(in srgb, ${gridLine} 60%, transparent)`},
        },
        y: {
          title: {display: true, text: 'Path loss (dB)', color: muted, font: {size: 11}},
          ticks: {color: muted, font: {size: 10}},
          grid: {color: `color-mix(in srgb, ${gridLine} 60%, transparent)`},
        },
      },
      plugins: {
        legend: {
          labels: {color: muted, font: {size: 11}, boxWidth: 12, usePointStyle: true},
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} dB`,
          },
        },
      },
    },
  });
}

function RadioIcon({className}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <line x1="12" y1="2" x2="12" y2="6" />
      <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none" />
      <rect x="6" y="6" width="12" height="15" rx="2" />
      <circle cx="12" cy="13" r="2.5" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  );
}

function WaveIcon({className}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="6.5" opacity="0.75" />
      <circle cx="12" cy="12" r="10.5" opacity="0.45" />
    </svg>
  );
}

function ForestIcon({className}) {
  return (
    <svg viewBox="0 0 32 24" className={className} fill="currentColor" aria-hidden="true">
      <g transform="translate(0,4) scale(0.8)">
        <polygon points="7,2 12,10 2,10" />
        <polygon points="7,6 13,15 1,15" />
        <rect x="5.7" y="15" width="2.6" height="4" />
      </g>
      <g transform="translate(11,1)">
        <polygon points="7,2 12,10 2,10" />
        <polygon points="7,6 13,15 1,15" />
        <rect x="5.7" y="15" width="2.6" height="4" />
      </g>
      <g transform="translate(21,5) scale(0.75)">
        <polygon points="7,2 12,10 2,10" />
        <polygon points="7,6 13,15 1,15" />
        <rect x="5.7" y="15" width="2.6" height="4" />
      </g>
    </svg>
  );
}

function AntennaIcon({className}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true">
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="7" y1="6" x2="17" y2="6" />
      <line x1="8.5" y1="10" x2="15.5" y2="10" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function ConnectorIcon({className}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M2 12 h6" />
      <rect x="8" y="7" width="8" height="10" rx="1.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M16 12 h6" />
    </svg>
  );
}

function ShieldIcon({className}) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <polygon points="12,2 20,5.5 20,11 12,22 4,11 4,5.5" />
    </svg>
  );
}

export default function FoliageCalculator() {
  const [freq, setFreq] = useState(DEFAULTS.freq);
  const [txPower, setTxPower] = useState(DEFAULTS.txPower);
  const [presetIndex, setPresetIndex] = useState(DEFAULTS.presetIndex);
  const [txGain, setTxGain] = useState(DEFAULTS.txGain);
  const [rxGain, setRxGain] = useState(DEFAULTS.rxGain);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [pigtailOn, setPigtailOn] = useState(DEFAULTS.pigtailOn);
  const [txLoss, setTxLoss] = useState(DEFAULTS.txLoss);
  const [rxLoss, setRxLoss] = useState(DEFAULTS.rxLoss);
  const [foliageOn, setFoliageOn] = useState(DEFAULTS.foliageOn);
  const [density, setDensity] = useState(DEFAULTS.density);
  const [displayDistance, setDisplayDistance] = useState(0);
  const [floatingVisible, setFloatingVisible] = useState(false);

  const preset = PRESETS[presetIndex];
  const txLossEff = pigtailOn ? txLoss : 0;
  const rxLossEff = pigtailOn ? rxLoss : 0;
  const densityEff = foliageOn ? density : 0;

  const mapl = computeMapl({
    txPowerDbm: txPower,
    txGainDbi: txGain,
    rxGainDbi: rxGain,
    txLossDb: txLossEff,
    rxLossDb: rxLossEff,
    linkBudgetDb: preset.linkBudget,
    marginDb: margin,
  });
  const sensitivity = ASSUMED_TX_DBM - preset.linkBudget;
  const pathLossDistance = solveUsableDistance(freq, mapl, densityEff);
  const rangeCapped = pathLossDistance > PRACTICAL_MAX_RANGE_M;
  const usableDistance = Math.min(pathLossDistance, PRACTICAL_MAX_RANGE_M);
  const fspl = fsplDb(freq, usableDistance);
  const foliage = weissbergerLossDb(freq / 1000, usableDistance, densityEff);

  // Percentages are of the *pre-margin* budget (mapl + margin), so the reserved margin — and,
  // in the rare capped-range case, any further unused headroom — shows up as its own share
  // alongside free-space and foliage, rather than the three being computed independently and
  // left to not quite add up.
  const budgetBeforeMargin = mapl + margin || 1;
  const fsplPct = (fspl / budgetBeforeMargin) * 100;
  const foliagePct = (foliage / budgetBeforeMargin) * 100;
  const marginPct = Math.max(0, 100 - fsplPct - foliagePct);
  const LABEL_MIN_PCT = 26;

  let validityWarning = null;
  if (mapl <= 0) {
    validityWarning = 'Link budget is exhausted before the signal leaves the radios — check your settings.';
  } else if (rangeCapped) {
    validityWarning =
      'Note: capped at 100 km, a generously optimistic ceiling for real terrestrial line-of-sight — the link budget alone would allow further, but Earth curvature, terrain, and Fresnel-zone clearance limit real-world range well before the math does.';
  } else if (foliageOn && usableDistance > 400) {
    validityWarning = `Note: distance exceeds Weissberger's validated 400 m range — result is extrapolated.`;
  }

  const densitySlider = Math.log2(density);
  const densityDescText =
    densitySlider < -0.08
      ? 'Lighter than baseline'
      : densitySlider > 0.08
        ? 'Denser than baseline'
        : 'Mixed deciduous/coniferous forest (Weissberger baseline)';

  function applyDensityFromSlider(rawSlider) {
    setDensity(Math.round(Math.pow(2, rawSlider) * 10) / 10);
  }

  function numberInput(setter) {
    return (e) => {
      const v = parseFloat(e.target.value);
      if (!Number.isNaN(v)) setter(v);
    };
  }

  function resetToDefaults() {
    setFreq(DEFAULTS.freq);
    setTxPower(DEFAULTS.txPower);
    setPresetIndex(DEFAULTS.presetIndex);
    setTxGain(DEFAULTS.txGain);
    setRxGain(DEFAULTS.rxGain);
    setMargin(DEFAULTS.margin);
    setPigtailOn(DEFAULTS.pigtailOn);
    setTxLoss(DEFAULTS.txLoss);
    setRxLoss(DEFAULTS.rxLoss);
    setFoliageOn(DEFAULTS.foliageOn);
    setDensity(DEFAULTS.density);
  }

  // Restore any previously-saved settings once on mount. Applied via effect
  // rather than the useState initializer, since Docusaurus prerenders this
  // page in Node (no window/localStorage) — reading here instead avoids a
  // hydration mismatch against the server-rendered DEFAULTS-based markup.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.freq === 'number') setFreq(saved.freq);
      if (typeof saved.txPower === 'number') setTxPower(saved.txPower);
      if (typeof saved.presetIndex === 'number' && PRESETS[saved.presetIndex]) setPresetIndex(saved.presetIndex);
      if (typeof saved.txGain === 'number') setTxGain(saved.txGain);
      if (typeof saved.rxGain === 'number') setRxGain(saved.rxGain);
      if (typeof saved.margin === 'number') setMargin(saved.margin);
      if (typeof saved.pigtailOn === 'boolean') setPigtailOn(saved.pigtailOn);
      if (typeof saved.txLoss === 'number') setTxLoss(saved.txLoss);
      if (typeof saved.rxLoss === 'number') setRxLoss(saved.rxLoss);
      if (typeof saved.foliageOn === 'boolean') setFoliageOn(saved.foliageOn);
      if (typeof saved.density === 'number') setDensity(saved.density);
    } catch {
      // Malformed or unavailable storage (private browsing, quota) — fall
      // back silently to the DEFAULTS already in state.
    }
  }, []);

  // Persist settings on every change so they survive a reload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          freq,
          txPower,
          presetIndex,
          txGain,
          rxGain,
          margin,
          pigtailOn,
          txLoss,
          rxLoss,
          foliageOn,
          density,
        }),
      );
    } catch {
      // Storage write failed (private browsing quota, etc.) — settings just
      // won't persist this session.
    }
  }, [freq, txPower, presetIndex, txGain, rxGain, margin, pigtailOn, txLoss, rxLoss, foliageOn, density]);

  // Tween the headline number toward each new usableDistance rather than snapping to it.
  useEffect(() => {
    let raf;
    const from = displayDistance;
    const to = usableDistance;
    const duration = 700;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplayDistance(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usableDistance]);

  // Show the floating distance pill once the main result card scrolls out of view (either
  // direction), so the headline number stays reachable while scrolling.
  const distanceCardRef = useRef(null);
  useEffect(() => {
    const node = distanceCardRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setFloatingVisible(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Position the "Tropical" suggestion marker at its equivalent point on the density slider's
  // log-scale track, and the margin slider's preset markers at their linear-scale positions.
  const densityRangeRef = useRef(null);
  const marginRangeRef = useRef(null);
  const [tropicalMarkLeft] = useTrackMarkerPositions(densityRangeRef, [(TROPICAL_SLIDER_POS + 1) / 2]);
  const marginMarkLefts = useTrackMarkerPositions(
    marginRangeRef,
    MARGIN_PRESETS.map((p) => (p.value - MARGIN_MIN) / (MARGIN_MAX - MARGIN_MIN)),
  );

  // Chart: created once, then updated in place as inputs change.
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    chartRef.current = buildChart(canvasRef.current);
    return () => chartRef.current.destroy();
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const xMax = Math.max(usableDistance * 1.6, 50);
    const steps = 60;
    const lossPoints = [];
    for (let i = 0; i <= steps; i++) {
      const d = (xMax / steps) * i;
      lossPoints.push({x: d, y: totalPathLossDb(freq, d, densityEff)});
    }
    const maplPoints = [
      {x: 0, y: mapl},
      {x: xMax, y: mapl},
    ];
    const yMax = Math.max(mapl, lossPoints[lossPoints.length - 1].y) * 1.15;
    const markerPoints = [
      {x: usableDistance, y: 0},
      {x: usableDistance, y: yMax},
    ];

    chart.data.datasets[0].data = lossPoints;
    chart.data.datasets[1].data = maplPoints;
    chart.data.datasets[2].data = markerPoints;
    chart.options.scales.y.suggestedMax = yMax;
    chart.update();
  }, [freq, mapl, usableDistance, densityEff]);

  const distanceDisplay = formatDistance(displayDistance);

  return (
    <Layout
      title="Foliage Link Range Calculator"
      description="Estimate usable radio link distance through foliage using Weissberger's Modified Exponential Decay model, with Meshtastic LoRa preset link budgets.">
      <button
        type="button"
        className={`button button--secondary button--sm ${styles.resetFab}`}
        onClick={resetToDefaults}>
        Reset to defaults
      </button>

      <main className="container margin-vert--lg">
        <p className={styles.kicker}>Weissberger MED Model</p>
        <Heading as="h1">Foliage Link Range Calculator</Heading>
        <p className={styles.description}>
          Estimates the maximum usable distance of a radio link routed through vegetation, combining
          free-space path loss with Weissberger&rsquo;s Modified Exponential Decay foliage attenuation model
          against a link budget built from Meshtastic LoRa modem presets.
        </p>

        <div className="row margin-top--lg">
          {/* CONTROLS */}
          <div className="col col--5 margin-bottom--lg">
            <div className="card margin-bottom--lg">
              <div className="card__header">
                <Heading as="h2">Radio</Heading>
              </div>
              <div className="card__body">
                <div className={styles.field}>
                  <div className={styles.fieldLabelRow}>
                    <label htmlFor="freq">Frequency</label>
                    <span className={styles.fieldValue}>{freq} MHz</span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={2450}
                    step={1}
                    value={freq}
                    onChange={(e) => setFreq(parseFloat(e.target.value))}
                    className={styles.slider}
                    style={sliderFillStyle(freq, 150, 2450)}
                  />
                  <input
                    type="number"
                    id="freq"
                    min={1}
                    max={6000}
                    step={1}
                    value={freq}
                    onChange={numberInput(setFreq)}
                    className={styles.numInput}
                  />
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabelRow}>
                    <label htmlFor="txPower">TX Power</label>
                    <span className={styles.fieldValue}>{txPower} dBm</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={0.5}
                    value={txPower}
                    onChange={(e) => setTxPower(parseFloat(e.target.value))}
                    className={styles.slider}
                    style={sliderFillStyle(txPower, 0, 30)}
                  />
                  <input
                    type="number"
                    id="txPower"
                    min={-10}
                    max={36}
                    step={0.5}
                    value={txPower}
                    onChange={numberInput(setTxPower)}
                    className={styles.numInput}
                  />
                </div>
              </div>
            </div>

            <div className="card margin-bottom--lg">
              <div className="card__header">
                <Heading as="h2">Modem Preset</Heading>
              </div>
              <div className="card__body">
                <p className={styles.cardNote}>
                  From the Meshtastic radio settings docs. Link budget assumes 22&nbsp;dBm TX and 0&nbsp;dBi
                  antennas — adjusted below for your actual setup.
                </p>

                <div className={styles.presetGrid} role="group" aria-label="Modem preset">
                  {PRESETS.map((p, i) => (
                    <button
                      key={p.key}
                      type="button"
                      className={`${styles.presetBtn} ${i === presetIndex ? styles.presetBtnActive : ''}`}
                      aria-pressed={i === presetIndex}
                      onClick={() => setPresetIndex(i)}>
                      <div className={styles.pname}>{p.name}</div>
                      <div className={styles.pmeta}>
                        SF{p.sf} · BW{p.bw} · {p.linkBudget}dB
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card margin-bottom--lg">
              <div className="card__header">
                <Heading as="h2">Foliage Density</Heading>
              </div>
              <div className="card__body">
                <label className={`${styles.toggleRow} margin-bottom--md`}>
                  <span className={styles.toggleRowLabel}>Include foliage loss</span>
                  <span
                    role="button"
                    tabIndex={0}
                    className={`${styles.toggle} ${foliageOn ? styles.toggleOn : ''}`}
                    onClick={() => setFoliageOn((v) => !v)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFoliageOn((v) => !v);
                      }
                    }}>
                    <span className={styles.toggleKnob} />
                  </span>
                </label>

                <div className={`${styles.toggleFields} ${foliageOn ? '' : styles.toggleFieldsDisabled}`}>
                  <p className={styles.cardNote}>
                    Scales Weissberger&rsquo;s excess vegetation attenuation term. The model&rsquo;s original
                    baseline data was measured through mixed deciduous/coniferous forest, in leaf.
                  </p>

                  <div className={styles.field} style={{marginBottom: '0.5rem'}}>
                    <div className={styles.fieldLabelRow}>
                      <label htmlFor="densityRange">Density</label>
                      <span className={styles.fieldValue}>{density.toFixed(2)}&times;</span>
                    </div>
                    <div className={styles.sliderTrackWrap}>
                      <button
                        type="button"
                        className={styles.suggestMark}
                        style={{left: `${tropicalMarkLeft}px`}}
                        title="Dense tropical rainforest ≈1.8× — denser, multi-layer canopy and higher moisture content than Weissberger's temperate mixed-forest baseline. Click to set."
                        onClick={() => setDensity(TROPICAL_DENSITY)}>
                        <span className={styles.suggestLabel}>Tropical</span>
                        <span className={styles.suggestTick} />
                      </button>
                      <input
                        type="range"
                        id="densityRange"
                        min={-1}
                        max={1}
                        step={0.01}
                        value={densitySlider}
                        onChange={(e) => applyDensityFromSlider(parseFloat(e.target.value))}
                        className={styles.slider}
                        style={sliderFillStyle(densitySlider, -1, 1)}
                        ref={densityRangeRef}
                      />
                    </div>
                    <div className={styles.marksRow}>
                      <span>½&times; light</span>
                      <span>baseline</span>
                      <span>2&times; heavy</span>
                    </div>
                  </div>
                  <p className={styles.densityDesc}>{densityDescText}</p>
                </div>
              </div>
            </div>

            <div className="card margin-bottom--lg">
              <div className="card__header">
                <Heading as="h2">Antennas &amp; Cabling</Heading>
              </div>
              <div className="card__body">
                <div className={styles.pairGrid}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabelRow}>
                      <label htmlFor="txGain">TX antenna</label>
                      <span className={styles.fieldValue}>{txGain} dBi</span>
                    </div>
                    <input
                      type="range"
                      id="txGain"
                      min={-5}
                      max={15}
                      step={0.5}
                      value={txGain}
                      onChange={(e) => setTxGain(parseFloat(e.target.value))}
                      className={styles.slider}
                      style={sliderFillStyle(txGain, -5, 15)}
                    />
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabelRow}>
                      <label htmlFor="rxGain">RX antenna</label>
                      <span className={styles.fieldValue}>{rxGain} dBi</span>
                    </div>
                    <input
                      type="range"
                      id="rxGain"
                      min={-5}
                      max={15}
                      step={0.5}
                      value={rxGain}
                      onChange={(e) => setRxGain(parseFloat(e.target.value))}
                      className={styles.slider}
                      style={sliderFillStyle(rxGain, -5, 15)}
                    />
                  </div>
                </div>

                <div className={styles.cableSection}>
                  <label className={styles.toggleRow}>
                    <span className={styles.toggleRowLabel}>Include connector / pigtail loss</span>
                    <span
                      role="button"
                      tabIndex={0}
                      className={`${styles.toggle} ${pigtailOn ? styles.toggleOn : ''}`}
                      onClick={() => setPigtailOn((v) => !v)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPigtailOn((v) => !v);
                        }
                      }}>
                      <span className={styles.toggleKnob} />
                    </span>
                  </label>

                  <div
                    className={`${styles.pigtailFields} ${styles.toggleFields} ${
                      pigtailOn ? '' : styles.toggleFieldsDisabled
                    }`}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabelRow}>
                        <label htmlFor="txLoss">TX pigtail</label>
                        <span className={styles.fieldValue}>{txLoss.toFixed(1)} dB</span>
                      </div>
                      <input
                        type="range"
                        id="txLoss"
                        min={0}
                        max={5}
                        step={0.1}
                        value={txLoss}
                        onChange={(e) => setTxLoss(parseFloat(e.target.value))}
                        className={styles.slider}
                        style={sliderFillStyle(txLoss, 0, 5)}
                      />
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldLabelRow}>
                        <label htmlFor="rxLoss">RX pigtail</label>
                        <span className={styles.fieldValue}>{rxLoss.toFixed(1)} dB</span>
                      </div>
                      <input
                        type="range"
                        id="rxLoss"
                        min={0}
                        max={5}
                        step={0.1}
                        value={rxLoss}
                        onChange={(e) => setRxLoss(parseFloat(e.target.value))}
                        className={styles.slider}
                        style={sliderFillStyle(rxLoss, 0, 5)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.field} style={{marginTop: '1.25rem'}}>
                  <div className={styles.fieldLabelRow}>
                    <label htmlFor="margin">
                      Link margin{' '}
                      <abbr
                        className={styles.abbrHelp}
                        title="Headroom reserved above bare sensitivity for real-world fading, multipath, and imperfect alignment. 0 dB solves for the theoretical edge where the link just barely closes in perfect conditions — not a reliable link. Typical practice: 10-20 dB for a generally reliable path, higher for rougher conditions.">
                        ?
                      </abbr>
                    </label>
                    <span className={styles.fieldValue}>{margin} dB</span>
                  </div>
                  <div className={styles.sliderTrackWrap}>
                    {MARGIN_PRESETS.map((p, i) => (
                      <button
                        key={p.label}
                        type="button"
                        className={styles.suggestMark}
                        style={{left: `${marginMarkLefts[i]}px`}}
                        title={`${p.label}: ${p.value} dB. Click to set.`}
                        onClick={() => setMargin(p.value)}>
                        <span className={styles.suggestLabel}>{p.label}</span>
                        <span className={styles.suggestTick} />
                      </button>
                    ))}
                    <input
                      type="range"
                      id="margin"
                      min={MARGIN_MIN}
                      max={MARGIN_MAX}
                      step={1}
                      value={margin}
                      onChange={(e) => setMargin(parseFloat(e.target.value))}
                      className={styles.slider}
                      style={sliderFillStyle(margin, MARGIN_MIN, MARGIN_MAX)}
                      ref={marginRangeRef}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="col col--7 margin-bottom--lg">
            <div className="card margin-bottom--lg" ref={distanceCardRef}>
              <div className="card__header">
                <Heading as="h2">
                  {foliageOn ? 'Usable distance through foliage' : 'Usable distance (free-space)'}
                </Heading>
              </div>
              <div className={`card__body ${styles.distanceBody}`}>
                <div className={styles.distanceRow}>
                  <span className={styles.distanceValue}>{distanceDisplay.value}</span>
                  <span className={styles.distanceUnit}>{distanceDisplay.unit}</span>
                </div>
                <div className={styles.budgetBarWrap}>
                  <p className={styles.budgetBarCaption}>
                    Total link budget (
                    <abbr
                      className={styles.abbrHelp}
                      title={`Maximum Allowable Path Loss — the total loss budget available for the link (TX power + antenna gains − cable losses − RX sensitivity), split below into free-space loss, foliage loss, and a reserved ${margin} dB link margin for real-world fading`}>
                      MAPL
                    </abbr>
                    ): {budgetBeforeMargin.toFixed(1)} dB
                  </p>
                  <div className={styles.budgetBar}>
                    <div
                      className={`${styles.seg} ${styles.segFspl} ${fsplPct < LABEL_MIN_PCT ? styles.labelHidden : ''}`}
                      style={{width: `${fsplPct}%`}}>
                      <span className={styles.segLabel}>
                        Free-space: <b>{fspl.toFixed(1)} dB</b> ({fsplPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div
                      className={`${styles.seg} ${styles.segFoliage} ${foliagePct < LABEL_MIN_PCT ? styles.labelHidden : ''}`}
                      style={{width: `${foliagePct}%`}}>
                      <span className={styles.segLabel}>
                        Foliage: <b>{foliage.toFixed(1)} dB</b> ({foliagePct.toFixed(0)}%)
                      </span>
                    </div>
                    <div
                      className={`${styles.seg} ${styles.segMargin} ${marginPct < LABEL_MIN_PCT ? styles.labelHidden : ''}`}
                      style={{width: `${marginPct}%`}}>
                      <span className={styles.segLabel}>
                        Margin: <b>{margin.toFixed(1)} dB</b> ({marginPct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>

                  {marginPct < LABEL_MIN_PCT && (
                    <div className={styles.marginCalloutRow}>
                      <span
                        className={styles.marginCalloutConnector}
                        style={{left: `${(fsplPct + foliagePct + 100) / 2}%`}}
                      />
                      <span className={styles.marginCalloutLabel}>
                        Margin: <b>{margin.toFixed(1)} dB</b> ({marginPct.toFixed(0)}%)
                      </span>
                    </div>
                  )}
                </div>

                {validityWarning && <p className={styles.validityWarning}>{validityWarning}</p>}
              </div>
            </div>

            <div className="card margin-bottom--lg">
              <div className="card__header">
                <Heading as="h2">Path loss vs. distance</Heading>
              </div>
              <div className="card__body">
                <div className={styles.chartWrap}>
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card margin-bottom--lg">
          <div className="card__header">
            <Heading as="h2">Breakdown</Heading>
          </div>
          <div className="card__body">
            <div className={styles.linkPath}>
              <div className={styles.linkNode}>
                <RadioIcon className={styles.linkIcon} />
                <span className={styles.linkNodeLabel}>Transmitter</span>
                <span className={styles.linkNodeValue}>{txPower}&nbsp;dBm</span>
              </div>

              <div className={styles.linkPathMiddle}>
                <div className={styles.linkPathBar}>
                  <div className={styles.linkPathZone}>
                    <AntennaIcon className={styles.linkPathZoneIcon} />
                    <div className={styles.linkPathZoneTrack} />
                    <span className={styles.linkPathZoneLabel}>TX ant.<br />{txGain}&nbsp;dBi</span>
                  </div>
                  {pigtailOn && (
                    <div className={styles.linkPathZone}>
                      <ConnectorIcon className={styles.linkPathZoneIcon} />
                      <div className={styles.linkPathZoneTrack} />
                      <span className={styles.linkPathZoneLabel}>TX pigtail<br />&minus;{txLoss.toFixed(1)}&nbsp;dB</span>
                    </div>
                  )}
                  <div className={`${styles.linkPathZone} ${styles.linkPathZoneFspl}`} style={{flexGrow: fsplPct}}>
                    <WaveIcon className={styles.linkPathZoneIcon} />
                    <div className={styles.linkPathZoneTrack} />
                    <span className={styles.linkPathZoneLabel}>Free-space<br />{fspl.toFixed(1)}&nbsp;dB</span>
                  </div>
                  <div
                    className={`${styles.linkPathZone} ${styles.linkPathZoneFoliage}`}
                    style={{flexGrow: foliagePct}}>
                    <ForestIcon className={styles.linkPathZoneIcon} />
                    <div className={styles.linkPathZoneTrack} />
                    <span className={styles.linkPathZoneLabel}>Foliage<br />{foliage.toFixed(1)}&nbsp;dB</span>
                  </div>
                  <div className={styles.linkPathZone} style={{flexGrow: marginPct}}>
                    <ShieldIcon className={styles.linkPathZoneIcon} />
                    <div className={styles.linkPathZoneTrack} />
                    <span className={styles.linkPathZoneLabel}>Margin<br />{margin.toFixed(1)}&nbsp;dB</span>
                  </div>
                  {pigtailOn && (
                    <div className={styles.linkPathZone}>
                      <ConnectorIcon className={styles.linkPathZoneIcon} />
                      <div className={styles.linkPathZoneTrack} />
                      <span className={styles.linkPathZoneLabel}>RX pigtail<br />&minus;{rxLoss.toFixed(1)}&nbsp;dB</span>
                    </div>
                  )}
                  <div className={styles.linkPathZone}>
                    <AntennaIcon className={styles.linkPathZoneIcon} />
                    <div className={styles.linkPathZoneTrack} />
                    <span className={styles.linkPathZoneLabel}>RX ant.<br />{rxGain}&nbsp;dBi</span>
                  </div>
                </div>
                <p className={styles.linkPathCaption}>
                  {distanceDisplay.value}&nbsp;{distanceDisplay.unit} &middot; {budgetBeforeMargin.toFixed(1)}&nbsp;dB total budget
                </p>
              </div>

              <div className={styles.linkNode}>
                <RadioIcon className={styles.linkIcon} />
                <span className={styles.linkNodeLabel}>Receiver &middot; {preset.name}</span>
                <span className={styles.linkNodeValue}>{sensitivity.toFixed(1)}&nbsp;dBm</span>
              </div>
            </div>
          </div>
        </div>

        <p className={styles.footer}>
          Weissberger Modified Exponential Decay model (valid ≈14–400&nbsp;m foliage depth, 230&nbsp;MHz–95&nbsp;GHz).
          Below 14&nbsp;m a linear approximation is used. Results are an estimate — real-world foliage, terrain, and
          Fresnel-zone obstruction vary widely.
        </p>
      </main>

      <div className={`${styles.floatingBar} ${floatingVisible ? styles.floatingBarVisible : ''}`} aria-hidden="true">
        <div className={styles.floatingBarInner}>
          <span className={styles.floatingBarLabel}>Usable distance</span>
          <span className={styles.floatingBarValue}>{distanceDisplay.value}&nbsp;{distanceDisplay.unit}</span>
        </div>
      </div>
    </Layout>
  );
}
