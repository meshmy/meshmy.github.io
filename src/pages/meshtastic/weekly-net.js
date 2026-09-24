import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CopyButton from '@site/src/components/Home/CopyButton';
import {Choice, ConfigCard, SettingRow, Settings} from '@site/src/components/Setup';
import useStoredState from '@site/src/components/Join/useStoredState';
import NetStatus from '@site/src/components/WeeklyNet/NetStatus';
import {buildAddChannelUrl, netChannel, weeklyNet} from '@site/src/data/meshtasticConfig';
import styles from './weekly-net.module.css';

const INITIAL = {via: 'rf'};
const addChannelUrl = netChannel ? buildAddChannelUrl(netChannel) : null;

const fixes = [
  {
    q: 'No acknowledgement came back',
    a: `Check you sent it on the net channel, not MediumFast, and that the net is open (every ${weeklyNet.day}, ${weeklyNet.hours} Malaysia time). No tick on your message means no node heard you: try from higher ground. If your node has the MQTT module set up, check in with CMQTT instead.`,
  },
  {
    q: 'The net channel isn’t in my channel list',
    a: 'Add it in step 1. It sits alongside your primary channel in the channel list, and you pick it when sending.',
  },
  {
    q: 'CRF or CMQTT?',
    a: 'CRF if your message leaves your node by radio and a nearby gateway puts it on MQTT. CMQTT if your own node has the MQTT module on and connects to the server itself. If you never set up the MQTT module, it’s CRF.',
  },
  {
    q: 'I sent the wrong message',
    a: 'No harm done: just send the right one.',
  },
];

export default function WeeklyNet() {
  const [state, update] = useStoredState('meshmy-weekly-net-v1', INITIAL);
  const checkIn = weeklyNet.checkIns.find((c) => c.id === state.via) ?? weeklyNet.checkIns[0];
  const other = weeklyNet.checkIns.find((c) => c.id !== checkIn.id);

  return (
    <Layout
      title="Weekly net"
      description={`${weeklyNet.tagline} MeshMY's weekly check-in net, every ${weeklyNet.day} ${weeklyNet.hours} Malaysia time: add the net channel and send your check-in.`}>
      <main className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>Weekly net</p>
              <Heading as="h1" className={styles.tagline} lang="ms">
                {weeklyNet.tagline}
              </Heading>
              <p className={styles.lead}>
                {weeklyNet.taglineEnglish} Every {weeklyNet.day}, the MeshMY
                community checks in on Meshtastic<sup>®</sup> with one message, so
                everyone can see who’s reachable.
              </p>
              <div className={styles.note}>
                <strong className={styles.noteLabel}>Not the main channel</strong>
                <p>
                  The net has its own channel{netChannel && <> (<code>{netChannel.name}</code>)</>},
                  added alongside your primary MediumFast channel. It doesn’t
                  replace it. First time on the mesh?{' '}
                  <Link to="/meshtastic/join">Set up your node first →</Link>
                </p>
              </div>
            </div>
            <aside className={styles.glance} aria-label="The net at a glance">
              <NetStatus />
              <dl>
                <div>
                  <dt>When</dt>
                  <dd>Every {weeklyNet.day}</dd>
                </div>
                <div>
                  <dt>Hours</dt>
                  <dd>{weeklyNet.hours} MYT</dd>
                </div>
                {netChannel && (
                  <div>
                    <dt>Channel</dt>
                    <dd>
                      <code>{netChannel.name}</code>
                    </dd>
                  </div>
                )}
                <div>
                  <dt>Net</dt>
                  <dd>{weeklyNet.name}</dd>
                </div>
                <div>
                  <dt>Check-ins</dt>
                  <dd>
                    <a href={weeklyNet.trackerUrl} target="_blank" rel="noreferrer">
                      MESH NET919 tracker ↗
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>
          </header>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true">1</span>
              <Heading as="h2" className={styles.stepTitle}>
                Add the net channel
              </Heading>
              {addChannelUrl ? (
                <ConfigCard
                  url={addChannelUrl}
                  qrTitle="QR code that adds the MeshMY weekly net channel"
                  intro={
                    <p>
                      This adds the net as a secondary channel. Your region,
                      preset, primary channel and MQTT settings stay as they are.
                    </p>
                  }>
                  <Settings>
                    <SettingRow label="Channel name" value={netChannel.name} copy />
                    <SettingRow label="Key (PSK)" value={netChannel.psk} copy />
                  </Settings>
                </ConfigCard>
              ) : (
                <p>
                  The net runs on its own secondary channel, kept separate from
                  the primary channel so net traffic doesn’t clutter it. Get the channel’s QR code or link from net
                  control, then in the app open <strong>Settings → Channels → Add
                  channel</strong> and scan or paste it. Your region, preset and
                  primary channel stay as they are.
                </p>
              )}
            </li>

            <li className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true">2</span>
              <Heading as="h2" className={styles.stepTitle}>
                Pick your check-in message
              </Heading>
              <Choice
                name="via"
                label="How does your node reach MQTT?"
                options={weeklyNet.checkIns.map((c) => ({value: c.id, label: c.label}))}
                value={checkIn.id}
                onChange={(via) => update({via})}
                className={styles.choice}
              />
              <div className={styles.message}>
                <code>{checkIn.message}</code>
                <CopyButton text={checkIn.message} label="Copy message" variant="solid" />
              </div>
              <p className={styles.fine}>
                {checkIn.via}. The other one, {checkIn.id === 'rf' ? 'for your own gateway' : 'over RF'}:{' '}
                <code>{other.message}</code>
              </p>
            </li>

            <li className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true">3</span>
              <Heading as="h2" className={styles.stepTitle}>
                Send it on the net channel
              </Heading>
              <p>
                Pick the net channel (not MediumFast), paste the message and send
                it. A tick means a node heard you. You should then get an{' '}
                <strong>acknowledgement</strong> back: that’s your check-in done.
              </p>
              <p className={styles.tracker}>
                Check-ins are tracked on{' '}
                <a href={weeklyNet.trackerUrl} target="_blank" rel="noreferrer">
                  MESH NET919 ↗
                </a>
                , so you can see who’s checked in each week.
              </p>
            </li>
          </ol>

          <section className={styles.section} aria-labelledby="fixes-heading">
            <Heading as="h2" id="fixes-heading">
              Quick fixes
            </Heading>
            {fixes.map((f) => (
              <details key={f.q} className={styles.more}>
                <summary>
                  {f.q}
                  <span className={styles.chev} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
            <p className={styles.fine}>
              Not on the mesh yet? Start with <Link to="/meshtastic/join">Join the mesh →</Link>.
              For anything else, come to a <Link to="/events">meetup →</Link>.
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
