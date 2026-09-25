import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CopyButton from '@site/src/components/Home/CopyButton';
import {Choice, ConfigCard, MeshtasticLink, SettingRow, Settings} from '@site/src/components/Setup';
import Term from '@site/src/components/Join/Term';
import useStoredState from '@site/src/components/Join/useStoredState';
import {
  apps,
  configUrl,
  configUrl433,
  recommended,
  recommended433,
  telegram,
} from '@site/src/data/meshtasticConfig';
import {glossary, pairing, questions, troubleshooting} from '@site/src/data/joinGuide';
import styles from './join.module.css';

// Build-time defaults: the most common newcomer. Also what shows without JS.
const INITIAL = {
  answers: {hasRadio: 'no', platform: 'android', licensed: 'no', band: '919'},
  done: {},
  area: '',
};
const REQUIRED = ['radio', 'app', 'settings', 'check'];

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One numbered step, with its "Done" tick. */
function Step({id, n, title, optional, done, onDone, autoDone, children}) {
  return (
    <li className={clsx(styles.step, done && styles.stepDone)} aria-labelledby={`step-${id}-title`}>
      <span className={styles.stepNum} aria-hidden="true">
        {done ? <CheckGlyph /> : n}
      </span>
      <div className={styles.stepHead}>
        <Heading as="h2" id={`step-${id}`} className={styles.stepTitle}>
          <span id={`step-${id}-title`}>{title}</span>
          {optional && <span className={styles.optional}>Optional</span>}
        </Heading>
        {autoDone ? (
          <span className={styles.doneNote}>
            Done<span className={styles.srOnly}>: {title}</span>
          </span>
        ) : (
          <label className={styles.doneToggle}>
            <input type="checkbox" checked={!!done} onChange={(e) => onDone(e.target.checked)} />
            <span>
              Done<span className={styles.srOnly}>: {title}</span>
            </span>
          </label>
        )}
      </div>
      <div className={styles.stepBody}>{children}</div>
    </li>
  );
}

function Note({tone = 'info', label, children}) {
  return (
    <div className={clsx(styles.note, styles[`note--${tone}`])}>
      {label && <strong className={styles.noteLabel}>{label}</strong>}
      <div>{children}</div>
    </div>
  );
}

export default function Join() {
  const [state, update, reset] = useStoredState('meshmy-join-v1', INITIAL);
  const {answers, done, area} = state;
  // Changing which band you're on means step 3's settings (and step 5's
  // check) no longer apply, so un-tick them.
  const answer = (id) => (value) =>
    update((s) => {
      const next = {...s.answers, [id]: value};
      const band = (a) => (a.licensed === 'yes' && a.band === '433' ? '433' : '919');
      return band(next) === band(s.answers)
        ? {answers: {[id]: value}}
        : {answers: {[id]: value}, done: {settings: false, check: false}};
    });
  const tick = (id) => (value) => update({done: {[id]: value}});

  const hasRadio = answers.hasRadio === 'yes';
  const licensed = answers.licensed === 'yes';
  const on433 = licensed && answers.band === '433';
  const settings = on433 ? recommended433 : recommended;
  const url = on433 ? configUrl433 : configUrl;
  const app = apps.find((a) => a.id === answers.platform) ?? apps[0];
  const isDone = (id) => (id === 'radio' && hasRadio) || !!done[id];
  const doneCount = REQUIRED.filter(isDone).length;
  const allDone = doneCount === REQUIRED.length;
  const hello = `Hello from ${area.trim() || 'Malaysia'}, new to the mesh!`;

  return (
    <Layout
      title="Join the mesh"
      description="Get your first Meshtastic node onto the MeshMY community mesh: a guided setup for beginners, with one-tap settings.">
      <main className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <p className={styles.eyebrow}>Meshtastic<sup>®</sup> · MeshMY</p>
            <Heading as="h1">Join the mesh</Heading>
            <p className={styles.lead}>
              Get your first node talking to the MeshMY community. Answer three
              questions and you’ll see only the steps you need. No licence
              needed on 919&nbsp;MHz.
            </p>
          </header>

          <section className={styles.setup} aria-labelledby="setup-heading">
            <div className={styles.setupHead}>
              <Heading as="h2" id="setup-heading" className={styles.setupTitle}>
                Your setup
              </Heading>
              <button type="button" className={styles.reset} onClick={reset}>
                Start over
              </button>
            </div>
            <div className={styles.questions}>
              {questions.map((q) => (
                <Choice
                  key={q.id}
                  name={q.id}
                  label={q.label}
                  options={q.options}
                  value={answers[q.id]}
                  onChange={answer(q.id)}
                />
              ))}
            </div>
            <div className={styles.progress}>
              <div
                className={styles.bar}
                role="progressbar"
                aria-label="Setup progress"
                aria-valuemin={0}
                aria-valuemax={REQUIRED.length}
                aria-valuenow={doneCount}
                aria-valuetext={`${doneCount} of ${REQUIRED.length} steps done`}>
                <span style={{width: `${(doneCount / REQUIRED.length) * 100}%`}} />
              </div>
              <span aria-hidden="true">
                {doneCount} of {REQUIRED.length} steps done
              </span>
            </div>
          </section>

          <ol className={styles.steps}>
            <Step
              id="radio"
              n={1}
              title={hasRadio ? 'Your radio' : 'Get a radio'}
              done={isDone('radio')}
              autoDone={hasRadio}
              onDone={tick('radio')}>
              {hasRadio ? (
                <p>
                  Charge it and keep it next to you. If it’s never been set up,
                  that’s fine: step 3 does it for you.
                </p>
              ) : (
                <>
                  <p>
                    Meshtastic runs on small, inexpensive <Term id="lora" /> radios.
                    For a first <Term id="node" />, look for:
                  </p>
                  <ul className={styles.list}>
                    <li>
                      <strong>The 915&nbsp;MHz version.</strong>{' '}
                      {licensed
                        ? 'That’s the one for MY_919. For 433 MHz you need a 433 MHz version.'
                        : 'That’s the one for MY_919. Radios are built for one band (433, 868 or 915 MHz), so check before you buy.'}
                    </li>
                    <li>
                      <strong>Bluetooth</strong>, so it pairs with your phone.
                    </li>
                    <li>
                      <strong>A battery</strong>, or a battery socket, so you can carry it.
                    </li>
                    <li>
                      <strong>A screen</strong> helps but is optional: it shows the pairing PIN and messages.
                    </li>
                  </ul>
                  <p>
                    Not sure which? <Link to="/meshtastic/buying-guide">Buying guide →</Link>{' '}
                    <a href="https://meshtastic.org/docs/hardware/devices/" target="_blank" rel="noreferrer">
                      Supported hardware ↗
                    </a>
                  </p>
                </>
              )}
            </Step>

            <Step id="app" n={2} title="Install the app and pair" done={isDone('app')} onDone={tick('app')}>
              <div className={styles.appRow}>
                <MeshtasticLink href={app.href} pill external>
                  Get the {app.label} app
                </MeshtasticLink>
                <span className={styles.others}>
                  Or:{' '}
                  {apps
                    .filter((a) => a.id !== app.id)
                    .map((a, i) => (
                      <span key={a.id}>
                        {i > 0 && ' · '}
                        <a href={a.href} target="_blank" rel="noreferrer">
                          {a.label} ↗
                        </a>
                      </span>
                    ))}
                </span>
              </div>
              <ol className={styles.numbered}>
                {pairing[app.id].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </Step>

            <Step id="settings" n={3} title="Apply MeshMY’s settings" done={isDone('settings')} onDone={tick('settings')}>
              {licensed && (
                <Choice
                  name="band"
                  label="Which band?"
                  className={styles.inlineChoice}
                  options={[
                    {value: '919', label: '919 MHz (everyone)'},
                    {value: '433', label: '433 MHz (licensed)'},
                  ]}
                  value={answers.band}
                  onChange={answer('band')}
                />
              )}
              {on433 && (
                <Note tone="warn" label="Licensed only">
                  433&nbsp;MHz is in Malaysia’s amateur radio band. Use it only with
                  a valid Malaysian amateur radio licence.
                </Note>
              )}
              <ConfigCard
                url={url}
                qrTitle={`QR code with MeshMY's ${on433 ? '433' : '919'} MHz Meshtastic settings`}
                intro={
                  <p>
                    {answers.platform === 'web'
                      ? 'Scan this code with the Meshtastic app on your phone, or copy the link and open it on the phone paired to your radio.'
                      : 'On this phone, tap Open in Meshtastic. On a computer, scan the code with the app instead.'}{' '}
                    It sets everything below in one go.
                  </p>
                }>
                <Settings>
                  <SettingRow label={<Term id="region" />} value={settings.region} hint={on433 ? '433 MHz, licensed' : '919 MHz, licence-free'} />
                  <SettingRow label={<Term id="preset" />} value={settings.modemPresetLabel} />
                  <SettingRow label={<Term id="channel">Primary channel</Term>} value={settings.channelDisplayName} hint="name left blank, default key" />
                  <SettingRow label="OK to MQTT · Uplink · Downlink" value="On" />
                </Settings>
                <p className={styles.fine}>
                  This replaces your node’s channels and LoRa settings. That’s what
                  you want on a new radio.
                </p>
              </ConfigCard>

              <details className={styles.more}>
                <summary>
                  Set it by hand instead
                  <span className={styles.chev} aria-hidden="true" />
                </summary>
                <Heading as="h3" className={styles.path}>
                  Radio configuration → LoRa
                </Heading>
                <Settings>
                  <SettingRow label="Region" value={settings.region} />
                  <SettingRow label="Modem preset" value={settings.modemPresetLabel} hint="what the rest of MeshMY uses" />
                  <SettingRow label={<Term id="hops">Max hops</Term>} value={String(settings.hopLimit)} hint="the default" />
                  <SettingRow label="OK to MQTT" value="On" hint="lets gateways bridge your messages" />
                </Settings>
                <Heading as="h3" className={styles.path}>
                  Radio configuration → Channels → primary channel
                </Heading>
                <Settings>
                  <SettingRow label="Name" value="(leave blank)" hint={`it becomes “${settings.channelDisplayName}”`} />
                  <SettingRow label={<Term id="psk" />} value="(leave the default)" />
                  <SettingRow label={<Term id="uplink" />} value="Both on" />
                </Settings>
                <p className={styles.fine}>
                  Don’t create a custom channel or change the key: the default
                  channel is what puts you on the air with everyone else.
                </p>
              </details>
            </Step>

            <Step id="gateway" n={4} title="Be your own gateway" optional done={isDone('gateway')} onDone={tick('gateway')}>
              <p>
                Most people skip this. With step 3 done, any nearby{' '}
                <Term id="gateway" /> already relays your messages over{' '}
                <Term id="mqtt" /> for you.
              </p>
              <p>
                If your node is often out of range of a gateway, it can reach MQTT
                itself: through your phone, or over Wi-Fi on some radios.{' '}
                <Link to="/meshtastic/mqtt">MQTT setup →</Link>
              </p>
            </Step>

            <Step id="check" n={5} title="Check you’re on the mesh" done={isDone('check')} onDone={tick('check')}>
              <ol className={styles.numbered}>
                <li>
                  Open the <strong>Nodes</strong> list in the app. Other nodes appear
                  as they announce themselves, usually within 15–30 minutes.
                </li>
                <li>
                  Say hello on the <strong>{settings.channelDisplayName}</strong> channel.
                  A tick means another node heard you.
                  <div className={styles.hello}>
                    <label className={styles.areaField}>
                      <span>Your area (optional)</span>
                      <input
                        type="text"
                        value={area}
                        maxLength={40}
                        placeholder="e.g. Petaling Jaya"
                        onChange={(e) => update({area: e.target.value})}
                      />
                    </label>
                    <span className={styles.helloRow}>
                      <code>{hello}</code>
                      <CopyButton text={hello} />
                    </span>
                  </div>
                </li>
                <li>
                  Look for your hello on MeshMY’s Telegram channel,{' '}
                  <a href={telegram.url} target="_blank" rel="noreferrer">
                    {telegram.handle} ↗
                  </a>
                  . It relays what reaches MQTT, so seeing it there means a gateway
                  carried your message.
                </li>
                <li>
                  Find yourself on the{' '}
                  <a href="https://meshmap2.lucifernet.com/" target="_blank" rel="noreferrer">
                    community mesh map ↗
                  </a>
                  . It shows nodes that reach MQTT, so allow up to an hour.
                </li>
              </ol>
            </Step>
          </ol>

          <div aria-live="polite">
            {allDone && (
              <section className={styles.success}>
                <Heading as="h2">You’re on the mesh</Heading>
                <p>Say hi at the weekly net: one message, and everyone can see who’s reachable.</p>
                <Link className={clsx('button button--lg', styles.cta)} to="/meshtastic/weekly-net">
                  Check in on the weekly net →
                </Link>
              </section>
            )}
          </div>

          <section className={styles.section} aria-labelledby="help-heading">
            <Heading as="h2" id="help-heading">
              Something not working?
            </Heading>
            <div className={styles.faq}>
              {troubleshooting.map((t) => (
                <details key={t.q} className={styles.more}>
                  <summary>
                    {t.q}
                    <span className={styles.chev} aria-hidden="true" />
                  </summary>
                  <p>{t.a}</p>
                </details>
              ))}
            </div>
            <p className={styles.muted}>
              Still stuck? Come to a <Link to="/events">meetup →</Link> or ask on{' '}
              <a href="https://github.com/meshmy" target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              .
            </p>
          </section>

          <section className={styles.section} aria-labelledby="words-heading">
            <Heading as="h2" id="words-heading">
              Words you’ll meet
            </Heading>
            <dl className={styles.glossary}>
              {Object.values(glossary).map((g) => (
                <div key={g.term}>
                  <dt>{g.term}</dt>
                  <dd>{g.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>
    </Layout>
  );
}
