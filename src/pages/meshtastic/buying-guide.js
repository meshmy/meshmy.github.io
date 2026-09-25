import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {Choice} from '@site/src/components/Setup';
import useStoredState from '@site/src/components/Join/useStoredState';
import {
  batteryTest,
  beforeYouBuy,
  chips,
  devices,
  features,
  formFactors,
  formatPrice,
  listingChecklist,
  pickRadios,
  pickerQuestions,
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

/** Yes / no / partly, by shape and word (never by colour alone). */
function Mark({value, note}) {
  const word = {yes: 'Yes', no: 'No', partly: 'Partly', unconfirmed: 'Unconfirmed'}[value];
  return (
    <span className={clsx(styles.mark, styles[`mark--${value}`])}>
      {value === 'yes' ? <CheckGlyph /> : <span className={styles.markShape} aria-hidden="true" />}
      <span>
        {word}
        {note && <small>{note}</small>}
      </span>
    </span>
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
              Any Meshtastic radio in its 915&nbsp;MHz version can join the
              MeshMY mesh on MY_919, so there’s no wrong choice. What changes is battery life, the
              screen, and how much you put together yourself. Answer four
              questions for a shortlist, or read on to compare.
            </p>
          </header>

          <section className={styles.before} aria-labelledby="before-heading">
            <Heading as="h2" id="before-heading" className={styles.beforeTitle}>
              Before you buy anything
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
            lead="The four questions above come down to a few choices. Here’s what each one means.">
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
            <div className={styles.tableWrap} role="region" aria-label="Battery bench test" tabIndex={0}>
              <table className={styles.table}>
                <caption>
                  Battery bench test at default settings.{' '}
                  <a href={batteryTest.source} target="_blank" rel="noreferrer">
                    Source ↗
                  </a>
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Radio</th>
                    <th scope="col">Chip</th>
                    <th scope="col">Battery</th>
                    <th scope="col">Ran for about</th>
                  </tr>
                </thead>
                <tbody>
                  {batteryTest.rows.map((r) => (
                    <tr key={r.radio}>
                      <th scope="row">{r.radio}</th>
                      <td>{chips[r.chip].short}</td>
                      <td>{r.battery}</td>
                      <td className={styles.num}>{r.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Heading as="h3" className={styles.sub}>
              The LoRa chip
            </Heading>
            <p className={styles.body}>
              The radio chip itself matters less, as long as it’s a recent one.
              Look for <strong>SX1262</strong>, or <strong>LR1110 / LR1121</strong>, in the
              specs. Meshtastic strongly recommends these over the older{' '}
              <strong>SX1276</strong>, found on the original T-Beam and Heltec V2:
              skip those, even when they’re cheap.
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
            title="Start, then upgrade"
            lead="Start with one radio. Upgrade when something bothers you, one thing at a time.">
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
            <p className={styles.routerNote}>
              <strong>Thinking about a router?</strong> A router on a roof or a
              hill needs a site, solar power, weatherproofing and a word with
              MeshMY first. It gets its own guide, coming later.
            </p>
          </Section>

          <Section id="picks" title="Every pick at a glance">
            <div className={styles.tableWrap} role="region" aria-label="Every pick at a glance" tabIndex={0}>
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
                    <th scope="col">433 MHz version</th>
                    <th scope="col">Runs MeshCore</th>
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
                      <td className={styles.markCell}>
                        <Mark value={d.band433.value} note={d.band433.note} />
                      </td>
                      <td className={styles.markCell}>
                        <Mark value={d.meshcore.value} note={d.meshcore.note} />
                      </td>
                      {priced && <td className={styles.num}>{formatPrice(d.priceRm) ?? '–'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.fine}>
              <strong>433 MHz</strong> is for licensed amateur radio operators only; everyone
              else uses MY_919. <strong>MeshCore</strong> is a different firmware for the same
              radios. It doesn’t talk to Meshtastic, so the mesh you join depends on the
              firmware you flash.
            </p>
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
              MeshMY doesn’t recommend or vouch for any shop. The Specs links go to each
              maker’s own product page.
            </p>
          </Section>

          <section className={styles.cta} aria-labelledby="cta-heading">
            <div>
              <Heading as="h2" id="cta-heading" className={styles.ctaTitle}>
                Got your radio?
              </Heading>
              <p>Charge it, fit the antenna, and set it up for MeshMY in a few minutes.</p>
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
