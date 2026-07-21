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

// Max allowable path loss given the full link budget chain.
function computeMapl({txPowerDbm, txGainDbi, rxGainDbi, txLossDb, rxLossDb, linkBudgetDb}) {
  const sensitivityDbm = ASSUMED_TX_DBM - linkBudgetDb;
  return txPowerDbm + txGainDbi + rxGainDbi - txLossDb - rxLossDb - sensitivityDbm;
}

// Binary search the largest distance whose total path loss stays within MAPL.
function solveUsableDistance(fMHz, maplDb, densityFactor = 1, maxSearchM = 10000) {
  if (maplDb <= 0) return 0;
  if (totalPathLossDb(fMHz, maxSearchM, densityFactor) <= maplDb) return maxSearchM;

  let lo = 0;
  let hi = maxSearchM;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (totalPathLossDb(fMHz, mid, densityFactor) <= maplDb) lo = mid;
    else hi = mid;
  }
  return lo;
}

function sliderFillStyle(value, min, max) {
  const pct = ((value - min) / (max - min)) * 100;
  return {'--fill': `${pct}%`};
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

export default function FoliageCalculator() {
  const [freq, setFreq] = useState(915);
  const [txPower, setTxPower] = useState(22);
  const [presetIndex, setPresetIndex] = useState(() => PRESETS.findIndex((p) => p.default));
  const [txGain, setTxGain] = useState(2);
  const [rxGain, setRxGain] = useState(2);
  const [pigtailOn, setPigtailOn] = useState(true);
  const [txLoss, setTxLoss] = useState(0.5);
  const [rxLoss, setRxLoss] = useState(0.5);
  const [density, setDensity] = useState(1);
  const [displayDistance, setDisplayDistance] = useState(0);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [tropicalMarkLeft, setTropicalMarkLeft] = useState(0);

  const preset = PRESETS[presetIndex];
  const txLossEff = pigtailOn ? txLoss : 0;
  const rxLossEff = pigtailOn ? rxLoss : 0;

  const mapl = computeMapl({
    txPowerDbm: txPower,
    txGainDbi: txGain,
    rxGainDbi: rxGain,
    txLossDb: txLossEff,
    rxLossDb: rxLossEff,
    linkBudgetDb: preset.linkBudget,
  });
  const sensitivity = ASSUMED_TX_DBM - preset.linkBudget;
  const usableDistance = solveUsableDistance(freq, mapl, density);
  const fspl = fsplDb(freq, usableDistance);
  const foliage = weissbergerLossDb(freq / 1000, usableDistance, density);

  const lossSum = fspl + foliage || 1;
  const fsplPct = (fspl / lossSum) * 100;
  const foliagePct = 100 - fsplPct;
  const LABEL_MIN_PCT = 26;

  let validityWarning = null;
  if (usableDistance > 400) {
    validityWarning = `Note: distance exceeds Weissberger's validated 400 m range — result is extrapolated.`;
  } else if (mapl <= 0) {
    validityWarning = 'Link budget is exhausted before the signal leaves the radios — check your settings.';
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
  // log-scale track.
  const densityRangeRef = useRef(null);
  useEffect(() => {
    function position() {
      const node = densityRangeRef.current;
      if (!node) return;
      const trackWidth = node.getBoundingClientRect().width;
      const pct = (TROPICAL_SLIDER_POS + 1) / 2;
      setTropicalMarkLeft(THUMB_WIDTH / 2 + pct * (trackWidth - THUMB_WIDTH));
    }
    position();
    window.addEventListener('resize', position);
    return () => window.removeEventListener('resize', position);
  }, []);

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
      lossPoints.push({x: d, y: totalPathLossDb(freq, d, density)});
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
  }, [freq, mapl, usableDistance, density]);

  const roundedDistance = Math.round(displayDistance).toLocaleString();

  return (
    <Layout
      title="Foliage Link Range Calculator"
      description="Estimate usable radio link distance through foliage using Weissberger's Modified Exponential Decay model, with Meshtastic LoRa preset link budgets.">
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

                  <div className={`${styles.pigtailFields} ${pigtailOn ? '' : styles.pigtailFieldsDisabled}`}>
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
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="col col--7 margin-bottom--lg">
            <div className={`card margin-bottom--lg ${styles.distanceCard}`} ref={distanceCardRef}>
              <div className="card__body">
                <p className={styles.distanceLabel}>Usable distance through foliage</p>
                <div className={styles.distanceRow}>
                  <span className={styles.distanceValue}>{roundedDistance}</span>
                  <span className={styles.distanceUnit}>m</span>
                </div>
                <div className={styles.budgetBarWrap}>
                  <p className={styles.budgetBarCaption}>
                    Total link budget (
                    <abbr
                      className={styles.abbrHelp}
                      title="Maximum Allowable Path Loss — the total loss the link can tolerate before the receiver drops below its sensitivity threshold">
                      MAPL
                    </abbr>
                    ): {mapl.toFixed(1)} dB
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
                  </div>
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

            <div className="card margin-bottom--lg">
              <div className="card__header">
                <Heading as="h2">Breakdown</Heading>
              </div>
              <div className="card__body">
                <dl className={styles.breakdownGrid}>
                  <div className={styles.bdItem}>
                    <dt>Max allowable path loss</dt>
                    <dd>{mapl.toFixed(1)} dB</dd>
                  </div>
                  <div className={styles.bdItem}>
                    <dt>RX sensitivity ({preset.name})</dt>
                    <dd>{sensitivity.toFixed(1)} dBm</dd>
                  </div>
                  <div className={styles.bdItem}>
                    <dt>Free-space loss @ distance</dt>
                    <dd>{fspl.toFixed(1)} dB</dd>
                  </div>
                  <div className={styles.bdItem}>
                    <dt>Foliage loss @ distance</dt>
                    <dd>{foliage.toFixed(1)} dB</dd>
                  </div>
                </dl>
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
          <span className={styles.floatingBarValue}>{roundedDistance}&nbsp;m</span>
        </div>
      </div>
    </Layout>
  );
}
