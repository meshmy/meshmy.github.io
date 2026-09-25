import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import NetworkMap from '@site/src/components/Home/NetworkMap';
import CopyButton from '@site/src/components/Home/CopyButton';
import {ConfigCard, MeshtasticLink, SettingRow, Settings} from '@site/src/components/Setup';
import {sites, siteStatus, siteElevation, STATUS, SITE_STATUS, maintainerOf, formatMetres} from '@site/src/data/sites';
import {apps, configUrl, recommended, weeklyNet} from '@site/src/data/meshtasticConfig';
import networkStats from '@site/src/data/networkStats.json';
import styles from './index.module.css';

const onAir = sites.filter((s) => ['online', 'partial'].includes(siteStatus(s)));
const highest = [...onAir].sort((a, b) => b.elevation - a.elevation)[0];
const bandsOnAir = [
  ...new Set(
    onAir.flatMap((s) => s.bands.filter((b) => (b.status || 'active') === 'active').map((b) => b.freq)),
  ),
].sort((a, b) => parseInt(b) - parseInt(a));

function Hero({focus, onSelect}) {
  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Meshtastic<sup>®</sup> community · Malaysia</p>
          <Heading as="h1" className={styles.heroTitle}>
            Messages that don’t need a signal.
          </Heading>
          <p className={styles.heroLead}>
            MeshMY is a volunteer community running solar-powered LoRa
            routers on hilltops around the Klang Valley, alongside the Penang
            community’s routers. No SIM, no internet, no subscription — anyone
            in Malaysia can join on 919&nbsp;MHz.
          </p>
          <div className={styles.heroActions}>
            <Link className={clsx('button button--lg', styles.cta)} to="#join">
              Join the mesh
            </Link>
            <Link className={clsx('button button--lg', styles.buttonQuiet)} to="/about">
              How it works
            </Link>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>Router sites on air</dt>
              <dd>{onAir.length}</dd>
            </div>
            <div>
              <dt>Highest site</dt>
              <dd>
                {formatMetres(highest.elevation)}
                <small> m</small>
              </dd>
            </div>
            <div>
              <dt>Bands</dt>
              <dd>
                {bandsOnAir.map((f) => parseInt(f)).join(' · ')}
                <small> MHz</small>
              </dd>
            </div>
          </dl>
        </div>
        <div className={styles.heroMap} id="network-map">
          <NetworkMap focus={focus} onSelect={onSelect} />
        </div>
      </div>
    </header>
  );
}

function SiteStrip({focused, onSelect}) {
  return (
    <section className={styles.section} aria-labelledby="network-heading">
      <div className="container">
        <div className={styles.sectionHead}>
          <div>
            <Heading as="h2" id="network-heading">
              The backbone
            </Heading>
            <p>
              High-site routers built and maintained by the MeshMY team and
              the Penang Meshtastic community. Pick one to see it on the map.
            </p>
          </div>
          <Link to="/meshtastic/infrastructure" className={styles.moreLink}>
            Hardware, antennas &amp; grid squares →
          </Link>
        </div>
        <ul className={styles.siteList}>
          {sites.map((site) => {
            const status = siteStatus(site);
            return (
              <li key={site.shortName}>
                <button
                  type="button"
                  className={clsx(
                    styles.site,
                    styles[`site--${status}`],
                    focused === site.shortName && styles.siteActive,
                  )}
                  aria-pressed={focused === site.shortName}
                  onClick={() => {
                    onSelect(site.shortName);
                    // The map sits above the cards on wide screens and under
                    // the hero copy on narrow ones: scroll to the map itself.
                    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    document
                      .getElementById('network-map')
                      ?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'center'});
                  }}>
                  <span className={styles.siteTop}>
                    <code>{site.shortName}</code>
                    <span className={styles.siteStatus}>
                      <i className={`mm-marker mm-marker--${status}`}>
                        <i className="mm-marker__pin" />
                      </i>
                      {SITE_STATUS[status].label}
                    </span>
                  </span>
                  <span className={styles.siteName}>{site.name}</span>
                  <span className={styles.siteMeta}>
                    {site.area} · {siteElevation(site)}
                  </span>
                  <span className={styles.siteMeta}>{maintainerOf(site).name}</span>
                  <span className={styles.bands}>
                    {site.bands.map((b) => (
                      <span
                        key={b.freq}
                        className={clsx(styles.band, styles[`band--${b.status || 'active'}`])}
                        title={b.statusNote}>
                        {b.freq}
                        <span className={styles.srOnly}>
                          {' '}· {STATUS[b.status || 'active'].label}
                        </span>
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
/** Counts with a fixed locale, like formatMetres. */
const formatCount = (n) => n.toLocaleString('en-GB');

/** "2025-12" → "December 2025"; "2026-09-24" → "24 September 2026". Fixed, so SSR and browser agree. */
function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d ? `${Number(d)} ` : ''}${MONTHS[Number(m) - 1]} ${y}`;
}

function Breakdown({title, rows}) {
  // Bars show each row's share of the whole, so a catch-all row doesn't
  // look like the biggest group.
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return (
    <div className={styles.breakdown}>
      <Heading as="h3">{title}</Heading>
      <ul>
        {rows.map((r) => (
          <li key={r.label}>
            <span className={styles.breakdownLabel}>{r.label}</span>
            <span className={styles.breakdownCount}>{formatCount(r.count)}</span>
            <span className={styles.bar} aria-hidden="true">
              <span style={{width: `${(r.count / total) * 100}%`}} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Counts from src/data/networkStats.json (`npm run stats` refreshes it). */
function MeshNumbers() {
  const {asOf, since, nodes, newInMonth, byType, byArea, byHardware} = networkStats;
  const count = (label) => byType.find((t) => t.label === label)?.count ?? 0;
  const areas = byArea.filter((a) => a.label !== 'Elsewhere').length;
  return (
    <section className={clsx(styles.section, styles.numbers)} aria-labelledby="numbers-heading">
      <div className="container">
        <div className={styles.sectionHead}>
          <div>
            <Heading as="h2" id="numbers-heading">
              The mesh in numbers
            </Heading>
            <p>
              Nodes heard over MQTT since {formatDate(since)} that share a
              position in Malaysia. Nodes that stay radio-only or keep their
              position private aren’t counted, so the mesh is bigger than this.
            </p>
          </div>
          <a href="https://meshmap2.lucifernet.com/" target="_blank" rel="noreferrer" className={styles.moreLink}>
            Live mesh map ↗
          </a>
        </div>
        <dl className={styles.tiles}>
          <div>
            <dt>Nodes heard</dt>
            <dd>{formatCount(nodes)}</dd>
            <dd className={styles.tileNote}>since {formatDate(since)}</dd>
          </div>
          <div>
            <dt>Set up as routers</dt>
            <dd>{formatCount(count('Routers'))}</dd>
            <dd className={styles.tileNote}>by their owners</dd>
          </div>
          <div>
            <dt>Areas</dt>
            <dd>{areas}</dd>
            <dd className={styles.tileNote}>across Malaysia</dd>
          </div>
          {newInMonth.count != null && (
            <div>
              <dt>New nodes</dt>
              <dd>{formatCount(newInMonth.count)}</dd>
              <dd className={styles.tileNote}>in {formatDate(newInMonth.month)}</dd>
            </div>
          )}
        </dl>
        <div className={styles.breakdowns}>
          <Breakdown title="By type" rows={byType} />
          <Breakdown title="By area" rows={byArea} />
          <Breakdown title="Popular radios" rows={byHardware} />
        </div>
        <p className={styles.numbersNote}>
          Snapshot from {formatDate(asOf)}. Types are the role each owner
          chose; areas are approximate, from the positions nodes share.
        </p>
      </div>
    </section>
  );
}

function Join() {
  useBrokenLinks().collectAnchor('join');
  return (
    <section id="join" className={clsx(styles.section, styles.join)} aria-labelledby="join-heading">
      <div className="container">
        <div className={styles.sectionHead}>
          <div>
            <Heading as="h2" id="join-heading">
              Get on the air in three steps
            </Heading>
            <p>No licence needed on 919&nbsp;MHz. Most people are on the mesh in ten minutes.</p>
          </div>
          <Link to="/meshtastic/join" className={styles.moreLink}>
            Full setup guide →
          </Link>
        </div>

        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepNum} aria-hidden="true">1</span>
            <Heading as="h3">Get a radio</Heading>
            <p>
              Any Meshtastic device works. A small handheld such as a Heltec
              T114, LilyGO T-Echo or RAK WisBlock makes a great first node.
            </p>
            <a
              className={styles.stepLink}
              href="https://meshtastic.org/docs/hardware/devices/"
              target="_blank"
              rel="noreferrer">
              Supported hardware ↗
            </a>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNum} aria-hidden="true">2</span>
            <Heading as="h3">Install the app</Heading>
            <p>Pair your radio over Bluetooth or USB and finish the app’s first-run setup.</p>
            <div className={styles.appLinks} role="group" aria-label="Get the Meshtastic app">
              {apps.map((app) => (
                <MeshtasticLink key={app.id} href={app.href} pill external>
                  {app.label}
                </MeshtasticLink>
              ))}
            </div>
          </li>
          <li className={clsx(styles.step, styles.stepWide)}>
            <span className={styles.stepNum} aria-hidden="true">3</span>
            <Heading as="h3">Apply MeshMY’s settings in one tap</Heading>
            <ConfigCard
              url={configUrl}
              qrTitle="QR code with MeshMY's Meshtastic settings"
              intro={
                <p>
                  On your phone, open the link; on a computer, scan the code
                  from the app. It sets everything below for you.
                </p>
              }>
              <Settings>
                <SettingRow label="Region" value={recommended.region} hint="919 MHz, licence-free" />
                <SettingRow label="Modem preset" value={recommended.modemPresetLabel} />
                <SettingRow
                  label="Primary channel"
                  value={recommended.channelDisplayName}
                  hint="name left blank, default key"
                />
                <SettingRow label="OK to MQTT · Uplink · Downlink" value="On" />
              </Settings>
              <p className={styles.fine}>
                Heads up: this replaces your node’s channels and LoRa
                settings. Licensed hams on 433&nbsp;MHz, use the{' '}
                <Link to="/meshtastic/join">full guide</Link> instead.
              </p>
            </ConfigCard>
          </li>
        </ol>

        <div className={styles.gateway}>
          <p className={styles.gatewayLine}>
            <span>
              <strong>Out of radio range?</strong> Your node can reach MQTT
              itself, through your phone or over Wi-Fi.
            </span>
            <Link to="/meshtastic/mqtt" className={styles.moreLink}>
              MQTT setup →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function Next() {
  return (
    <section className={styles.section} aria-labelledby="next-heading">
      <div className="container">
        <Heading as="h2" id="next-heading" className={styles.sectionTitle}>
          Once you’re on the mesh
        </Heading>
        <div className={styles.cards}>
          <article className={clsx(styles.card, styles.cardNet)}>
            <p className={styles.cardKicker}>
              Weekly net · {weeklyNet.day}s, {weeklyNet.hours} MYT
            </p>
            <Heading as="h3">Check in and say hello</Heading>
            <p>Send one message on the net channel so everyone can see who’s reachable.</p>
            <ul className={styles.checkins}>
              {weeklyNet.checkIns.map((c) => (
                <li key={c.message}>
                  <span className={styles.checkinVia}>{c.via}</span>
                  <span className={styles.checkinRow}>
                    <code>{c.message}</code>
                    <CopyButton text={c.message} />
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/meshtastic/weekly-net" className={styles.stepLink}>
              Add the net channel →
            </Link>
          </article>
          <article className={styles.card}>
            <p className={styles.cardKicker}>Tool</p>
            <Heading as="h3">Foliage calculator</Heading>
            <p>Estimate how far your link will reach through trees for your radio and modem preset.</p>
            <Link to="/meshtastic/foliage-calculator" className={styles.stepLink}>
              Open the calculator →
            </Link>
          </article>
          <article className={styles.card}>
            <p className={styles.cardKicker}>Community</p>
            <Heading as="h3">Meet up &amp; build</Heading>
            <p>Help place a new hilltop site, share an antenna build, or just come say hi.</p>
            <div className={styles.cardLinks}>
              <Link to="/events" className={styles.stepLink}>Events →</Link>
              <a href="https://github.com/meshmy" target="_blank" rel="noreferrer" className={styles.stepLink}>
                GitHub ↗
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  // `n` changes on every pick, so choosing the same site again re-focuses it.
  const [focus, setFocus] = useState(null);
  const select = (name) => setFocus((f) => ({name, n: (f?.n ?? 0) + 1}));
  return (
    <Layout
      title="Off-grid messaging for Malaysia"
      description="MeshMY is a volunteer Meshtastic community running solar-powered LoRa routers around the Klang Valley, alongside Penang's community routers. Join the mesh on 919 MHz in three steps.">
      <div id="top" />
      <Hero focus={focus} onSelect={select} />
      <main>
        <SiteStrip focused={focus?.name} onSelect={select} />
        <MeshNumbers />
        <Join />
        <Next />
      </main>
    </Layout>
  );
}
