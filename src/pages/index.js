import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import NetworkMap from '@site/src/components/Home/NetworkMap';
import CopyButton from '@site/src/components/Home/CopyButton';
import ConfigQr from '@site/src/components/Home/ConfigQr';
import {sites, siteStatus, SITE_STATUS} from '@site/src/data/sites';
import {configUrl, recommended, mqtt, weeklyNet} from '@site/src/data/meshtasticConfig';
import styles from './index.module.css';

const onAir = sites.filter((s) => ['online', 'partial'].includes(siteStatus(s)));
const highest = [...onAir].sort((a, b) => b.elevation - a.elevation)[0];
const bandsOnAir = [
  ...new Set(
    onAir.flatMap((s) => s.bands.filter((b) => (b.status || 'active') === 'active').map((b) => b.freq)),
  ),
].sort((a, b) => parseInt(b) - parseInt(a));

function Hero({focus, setFocus}) {
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
            routers on hilltops around the Klang Valley. No SIM, no
            internet, no subscription — anyone in Malaysia can join on
            919&nbsp;MHz.
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
                {highest.elevation.toLocaleString()}
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
        <div className={styles.heroMap}>
          <NetworkMap focus={focus} onSelect={setFocus} />
        </div>
      </div>
    </header>
  );
}

function SiteStrip({focus, setFocus}) {
  return (
    <section className={styles.section} aria-labelledby="network-heading">
      <div className="container">
        <div className={styles.sectionHead}>
          <div>
            <Heading as="h2" id="network-heading">
              The backbone
            </Heading>
            <p>
              High-site routers the MeshMY team builds and maintains. Pick one
              to see it on the map.
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
                    focus === site.shortName && styles.siteActive,
                  )}
                  aria-pressed={focus === site.shortName}
                  onClick={() => {
                    setFocus(site.shortName);
                    document.getElementById('top')?.scrollIntoView({behavior: 'smooth', block: 'start'});
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
                    {site.area} · {site.elevation.toLocaleString()} m
                  </span>
                  <span className={styles.bands}>
                    {site.bands.map((b) => (
                      <span
                        key={b.freq}
                        className={clsx(styles.band, styles[`band--${b.status || 'active'}`])}
                        title={b.statusNote}>
                        {b.freq}
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

/** A call to action that leads into Meshtastic: their green + official logo. */
function MeshtasticButton({href, children}) {
  const logo = useBaseUrl('/img/meshtastic/Mesh_Logo_Black.svg');
  return (
    <a className={clsx('button', styles.mtButton)} href={href}>
      <img src={logo} alt="" width="26" height="14" />
      {children}
    </a>
  );
}

function SettingRow({label, value, hint, copy}) {
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
            <div className={styles.appLinks} aria-label="Get the Meshtastic app">
              <a href="https://play.google.com/store/apps/details?id=com.geeksville.mesh" target="_blank" rel="noreferrer">
                Android
              </a>
              <a href="https://apps.apple.com/us/app/meshtastic/id1586432531" target="_blank" rel="noreferrer">
                iOS
              </a>
              <a href="https://client.meshtastic.org/" target="_blank" rel="noreferrer">
                Web
              </a>
            </div>
          </li>
          <li className={clsx(styles.step, styles.stepWide)}>
            <span className={styles.stepNum} aria-hidden="true">3</span>
            <Heading as="h3">Apply MeshMY’s settings in one tap</Heading>
            <div className={styles.configCard}>
              <div className={styles.qr}>
                <ConfigQr value={configUrl} title="QR code with MeshMY's Meshtastic settings" />
                <small>Scan in the Meshtastic app</small>
              </div>
              <div className={styles.configBody}>
                <p>
                  On your phone, open the link; on a computer, scan the code
                  from the app. It sets everything below for you.
                </p>
                <div className={styles.configActions}>
                  <MeshtasticButton href={configUrl}>Open in Meshtastic</MeshtasticButton>
                  <CopyButton text={configUrl} label="Copy link" variant="solid" />
                </div>
                <dl className={styles.settings}>
                  <SettingRow label="Region" value={recommended.region} hint="919 MHz, licence-free" />
                  <SettingRow label="Modem preset" value={recommended.modemPresetLabel} />
                  <SettingRow
                    label="Primary channel"
                    value={recommended.channelDisplayName}
                    hint="name left blank, default key"
                  />
                  <SettingRow label="OK to MQTT · Uplink · Downlink" value="On" />
                </dl>
                <p className={styles.fine}>
                  Heads up: this replaces your node’s channels and LoRa
                  settings. Licensed hams on 433&nbsp;MHz, use the{' '}
                  <Link to="/meshtastic/join">full guide</Link> instead.
                </p>
              </div>
            </div>
          </li>
        </ol>

        <details className={styles.gateway}>
          <summary>
            <span>
              <strong>Out of RF range?</strong> Make your node its own MQTT
              gateway
            </span>
            <span className={styles.chev} aria-hidden="true" />
          </summary>
          <p>
            Enable <em>Module Configuration → MQTT</em> and use MeshMY’s
            community server (run by 9W2LWK). Your node will also show up on
            the <a href="https://meshmap2.lucifernet.com/" target="_blank" rel="noreferrer">community mesh map</a>.
          </p>
          <dl className={styles.settings}>
            <SettingRow label="Address" value={mqtt.address} copy />
            <SettingRow label="Username" value={mqtt.username} copy />
            <SettingRow label="Password" value={mqtt.password} copy />
            <SettingRow label="Root topic" value={mqtt.rootTopic} copy />
            <SettingRow label="Encryption" value="Enabled" />
          </dl>
        </details>
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
            <p className={styles.cardKicker}>Weekly net · {weeklyNet.hours}</p>
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
  const [focus, setFocus] = useState(null);
  return (
    <Layout
      title="Off-grid messaging for Malaysia"
      description="MeshMY is a volunteer Meshtastic community running solar-powered LoRa routers around the Klang Valley. Join the mesh on 919 MHz in three steps.">
      <div id="top" />
      <Hero focus={focus} setFocus={setFocus} />
      <main>
        <SiteStrip focus={focus} setFocus={setFocus} />
        <Join />
        <Next />
      </main>
    </Layout>
  );
}
