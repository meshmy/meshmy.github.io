import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {Choice} from '@site/src/components/Setup';
import useStoredState from '@site/src/components/Join/useStoredState';
import {
  bands,
  beforeYouBuy,
  chips,
  devices,
  features,
  formFactors,
  formatPrice,
  listingChecklist,
  pickRadios,
  pickerQuestions,
  powerTest,
  pricesAsOf,
  starts,
  upgrades,
} from '@site/src/data/hardware';
import styles from './buying-guide.module.css';

// Build-time defaults: the most common newcomer. Also what shows without JS.
const INITIAL = {answers: {where: 'carry', phone: 'phone', diy: 'no', wifi: 'no'}};

const byId = Object.fromEntries(devices.map((d) => [d.id, d]));

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The maker's product page. In the table, the row already names the radio. */
function SpecsLink({device, named = true}) {
  return (
    <a href={device.url} target="_blank" rel="noreferrer" className={styles.specs}>
      Specs{named && <span className={styles.srOnly}>: {device.name}</span>} ↗
    </a>
  );
}

/** One radio as a card: the picker's results and the start picks. */
function PickCard({device}) {
  const price = formatPrice(device.priceRm);
  return (
    <article className={styles.pick}>
      <p className={styles.pickMaker}>
        {device.maker} · {chips[device.chip].short} · {device.form === 'ready' ? 'Ready to use' : 'Bare board'}
      </p>
      <Heading as="h4" className={styles.pickName}>
        {device.name}
      </Heading>
      <p className={styles.pickWhy}>{device.why}</p>
      <div className={styles.pickFoot}>
        {price && <span className={styles.price}>{price}</span>}
        <SpecsLink device={device} />
      </div>
    </article>
  );
}

function Picker() {
  const [state, update, reset] = useStoredState('meshmy-buying-guide-v1', INITIAL);
  const {answers} = state;
  const result = pickRadios(answers);
  const picks = result.ids.map((id) => byId[id]);
  const chipIds = [...new Set(picks.map((d) => d.chip))];
  // Announced only after the user changes an answer, and only the names:
  // not on load (saved answers arrive after mount), and not every card.
  const [announcement, setAnnouncement] = useState('');
  const answer = (id) => (value) => {
    const next = {...answers, [id]: value};
    update({answers: {[id]: value}});
    setAnnouncement(`Shortlist: ${pickRadios(next).ids.map((i) => byId[i].name).join(', ')}.`);
  };

  return (
    <section className={styles.picker} aria-labelledby="picker-heading">
      <div className={styles.pickerHead}>
        <Heading as="h2" id="picker-heading" className={styles.pickerTitle}>
          Find your radio
        </Heading>
        <button type="button" className={styles.reset} onClick={reset}>
          Start over
        </button>
      </div>
      <div className={styles.questions}>
        {pickerQuestions.map((q) => (
          <Choice
            key={q.id}
            name={q.id}
            label={q.label}
            hint={q.why}
            options={q.options}
            value={answers[q.id]}
            onChange={answer(q.id)}
          />
        ))}
      </div>
      <p className={styles.srOnly} aria-live="polite">
        {announcement}
      </p>
      <div className={styles.result}>
        <Heading as="h3" className={styles.resultTitle}>
          Your shortlist
        </Heading>
        {result.note && <p className={styles.resultNote}>{result.note}</p>}
        <div className={styles.picks}>
          {picks.map((d) => (
            <PickCard key={d.id} device={d} />
          ))}
        </div>
        {chipIds.map((c) => (
          <p key={c} className={styles.fine}>
            <strong>{chips[c].name}:</strong> {chips[c].summary}
          </p>
        ))}
      </div>
    </section>
  );
}

function Section({id, title, lead, children}) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <Heading as="h2" id={id}>
        {title}
      </Heading>
      {lead && <p className={styles.sectionLead}>{lead}</p>}
      {children}
    </section>
  );
}

export default function BuyingGuide() {
  const priced = devices.some((d) => d.priceRm);
  return (
    <Layout
      title="Buying guide"
      description="Which Meshtastic radio to buy in Malaysia: ESP32 or nRF52, ready-made or build it yourself, and where to go next for range and battery life.">
      <main className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <p className={styles.eyebrow}>Meshtastic<sup>®</sup> · Buying guide</p>
            <Heading as="h1">Choose your first radio</Heading>
            <p className={styles.lead}>
              Any high-band Meshtastic radio can join the MeshMY mesh on
              MY_919. The radios differ in battery life, screen,
              and how much you put together yourself. Answer four questions for
              a shortlist, or read on to compare.
            </p>
          </header>

          <section className={styles.before} aria-labelledby="before-heading">
            <Heading as="h2" id="before-heading" className={styles.beforeTitle}>
              Before you buy
            </Heading>
            <ol className={styles.beforeList}>
              {beforeYouBuy.map((b) => (
                <li key={b.title}>
                  <strong>{b.title}</strong> {b.text}
                </li>
              ))}
            </ol>
          </section>

          <Picker />

          <Section
            id="compare"
            title="How the options compare"
            lead="More detail on the four questions above.">
            <Heading as="h3" className={styles.sub}>
              The chip: nRF52 or ESP32
            </Heading>
            <p className={styles.body}>
              The chip that runs Meshtastic decides battery life and whether the radio has Wi-Fi.
            </p>
            <div className={styles.chipGrid}>
              {['nrf52', 'esp32'].map((c) => (
                <div key={c} className={styles.card}>
                  <p className={styles.cardKicker}>{chips[c].short}</p>
                  <Heading as="h4" className={styles.cardTitle}>
                    {chips[c].headline}
                  </Heading>
                  <ul className={styles.list}>
                    {chips[c].points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className={styles.tableWrap} role="region" aria-label="Measured current draw" tabIndex={0}>
              <table className={styles.table}>
                <caption>
                  Current draw in mA with Bluetooth on, measured by Meshtastic users from a
                  3.7&nbsp;V battery on firmware 2.3.10.{' '}
                  <a href={powerTest.source} target="_blank" rel="noreferrer">
                    Measurements ↗
                  </a>
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Radio</th>
                    <th scope="col">Chip</th>
                    <th scope="col">Screen on</th>
                    <th scope="col">Screen off</th>
                  </tr>
                </thead>
                <tbody>
                  {powerTest.rows.map((r) => (
                    <tr key={r.radio}>
                      <th scope="row">{r.radio}</th>
                      <td>{chips[r.chip].short}</td>
                      <td className={styles.num}>{r.screenOn ?? '–'}</td>
                      <td className={styles.num}>{r.screenOff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.body}>
              Most radios use one of these two chips. Meshtastic also runs on RP2040 and
              RP2350, STM32WL, and Linux computers such as a Raspberry Pi with a LoRa board.{' '}
              <a href="https://meshtastic.org/docs/getting-started/#supported-hardware" target="_blank" rel="noreferrer">
                Supported platforms ↗
              </a>
            </p>

            <Heading as="h3" className={styles.sub}>
              Frequency bands
            </Heading>
            <p className={styles.body}>
              The LoRa chip in most radios, the SX1262, covers 150–960&nbsp;MHz, but each
              board’s antenna and radio parts are tuned for one part of that range. Makers
              sell a separate version for each band. Any high-band version works on MY_919
              (919–924&nbsp;MHz). The 915&nbsp;MHz version is the best choice, because the
              antenna it comes with is tuned closest to MY_919. Other versions, especially
              868&nbsp;MHz, can have less range with their original antenna.
            </p>
            <div className={styles.tableWrap} role="region" aria-label="Frequency bands" tabIndex={0}>
              <table className={styles.table}>
                <caption>
                  Typical tuning ranges from maker datasheets.{' '}
                  <a href="https://www.semtech.com/products/wireless-rf/lora-connect/sx1262" target="_blank" rel="noreferrer">
                    SX1262 ↗
                  </a>
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Band</th>
                    <th scope="col">Tuned for</th>
                    <th scope="col">Sold as</th>
                    <th scope="col">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((b) => (
                    <tr key={b.band}>
                      <th scope="row">{b.band}</th>
                      <td className={styles.num}>{b.range}</td>
                      <td>{b.soldAs}</td>
                      <td>{b.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Heading as="h3" className={styles.sub}>
              The LoRa chip
            </Heading>
            <p className={styles.body}>
              Look for <strong>SX1262</strong>, <strong>LR1110</strong> or{' '}
              <strong>LR1121</strong> in the specs. Meshtastic strongly recommends
              these over the older <strong>SX1276</strong>, used on the original
              T-Beam and the Heltec V2, so skip boards with the SX1276.
            </p>

            <Heading as="h3" className={styles.sub}>
              Form factors
            </Heading>
            <div className={styles.cardGrid}>
              {formFactors.map((f) => (
                <div key={f.title} className={styles.card}>
                  <Heading as="h4" className={styles.cardTitle}>
                    {f.title}
                  </Heading>
                  <p>{f.text}</p>
                  {f.examples && <p className={styles.examples}>For example: {f.examples}</p>}
                </div>
              ))}
            </div>

            <Heading as="h3" className={styles.sub}>
              Features and sensors
            </Heading>
            <dl className={styles.features}>
              {features.map((f) => (
                <div key={f.title}>
                  <dt>{f.title}</dt>
                  <dd>{f.text}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section
            id="upgrade"
            title="What to buy first, and what to upgrade"
            lead="Start with one radio. Upgrade one thing at a time, when you need to.">
            <div className={styles.startGrid}>
              {starts.map((s) => (
                <div key={s.title} className={styles.start}>
                  <p className={styles.cardKicker}>{s.kicker}</p>
                  <Heading as="h3" className={styles.cardTitle}>
                    {s.title}
                  </Heading>
                  <p className={styles.body}>{s.text}</p>
                  <div className={styles.picks}>
                    {s.ids.map((id) => (
                      <PickCard key={id} device={byId[id]} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Heading as="h3" className={styles.sub}>
              Upgrade paths
            </Heading>
            <div className={styles.cardGrid}>
              {upgrades.map((u) => (
                <div key={u.title} className={styles.card}>
                  <p className={styles.cardKicker}>{u.kicker}</p>
                  <Heading as="h4" className={styles.cardTitle}>
                    {u.title}
                  </Heading>
                  <p>{u.text}</p>
                  {u.ids && (
                    <p className={styles.examples}>
                      Picks: {u.ids.map((id) => byId[id].name).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section id="picks" title="All the picks">
            <div className={styles.tableWrap} role="region" aria-label="All the picks" tabIndex={0}>
              <table className={clsx(styles.table, styles.picksTable)}>
                <caption>
                  {priced ? `Typical prices in Malaysia, ${pricesAsOf}. ` : ''}
                  Meshtastic runs on all of them.{' '}
                  <a href="https://meshtastic.org/docs/hardware/devices/" target="_blank" rel="noreferrer">
                    Every supported radio ↗
                  </a>
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Radio</th>
                    <th scope="col">Chip</th>
                    <th scope="col">Screen</th>
                    <th scope="col">GPS</th>
                    <th scope="col">In the box</th>
                    <th scope="col">Antenna plug</th>
                    {priced && <th scope="col">Price</th>}
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <th scope="row">
                        {d.name}
                        <SpecsLink device={d} named={false} />
                      </th>
                      <td>{chips[d.chip].short}</td>
                      <td>{d.screen}</td>
                      <td>{d.gps}</td>
                      <td className={styles.wide}>{d.inBox}</td>
                      <td>{d.connector}</td>
                      {priced && <td className={styles.num}>{formatPrice(d.priceRm) ?? '–'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="checklist" title="Check the listing before you pay">
            <ul className={styles.checklist}>
              {listingChecklist.map((c) => (
                <li key={c.title}>
                  <CheckGlyph />
                  <span>
                    <strong>{c.title}</strong> {c.text}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.fine}>
              MeshMY does not endorse any maker or seller. Links to makers’ product pages
              are provided for convenience only.
            </p>
          </Section>

          <Section id="amateur" title="For licensed amateur radio operators">
            <p className={styles.body}>
              If you hold a Malaysian amateur radio licence, you can also use Meshtastic on
              the 70&nbsp;cm band. You need the low-band 433&nbsp;MHz version of the radio,
              not the 470&nbsp;MHz version, which is for China.
            </p>
            <ul className={styles.list}>
              <li>
                <strong>MY_433</strong> covers 433–435&nbsp;MHz. MeshMY runs a 433&nbsp;MHz network
                alongside MY_919.
              </li>
              <li>
                <strong>ITU3_70CM</strong> covers the ITU Region&nbsp;3 amateur band,
                430–450&nbsp;MHz. It arrives in firmware 2.8, which is in alpha as of September
                2026, and it needs licensed mode.
              </li>
            </ul>
            <p className={styles.body}>
              In licensed mode, the channel has no encryption key and your long name should be
              your callsign.{' '}
              <a href="https://meshtastic.org/docs/configuration/radio/user/" target="_blank" rel="noreferrer">
                Meshtastic user settings ↗
              </a>
            </p>
            <Heading as="h3" className={styles.sub}>
              Picks with a 433 MHz version
            </Heading>
            <ul className={styles.list}>
              {devices
                .filter((d) => d.lowBand)
                .map((d) => (
                  <li key={d.id}>
                    {d.name}
                    {typeof d.lowBand === 'string' && `: ${d.lowBand}`}
                  </li>
                ))}
            </ul>
          </Section>

          <section className={styles.cta} aria-labelledby="cta-heading">
            <div>
              <Heading as="h2" id="cta-heading" className={styles.ctaTitle}>
                Set up your radio
              </Heading>
              <p>When it arrives, charge it, fit the antenna, and follow the setup steps for MeshMY.</p>
            </div>
            <Link to="/meshtastic/join" className={clsx('button', 'button--lg', styles.ctaButton)}>
              Connect to the mesh →
            </Link>
          </section>
        </div>
      </main>
    </Layout>
  );
}
