import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {SettingRow, Settings} from '@site/src/components/Setup';
import {mqtt, setupGuideSource, telegram} from '@site/src/data/meshtasticConfig';
import styles from './mqtt.module.css';

const on = 'On';
const off = 'Off';

/** The server block shared by the phone and Wi-Fi methods. */
function ServerSettings({proxy}) {
  return (
    <>
      <Heading as="h3" className={styles.path}>
        Module configuration → MQTT
      </Heading>
      <Settings>
        <SettingRow label="MQTT enabled" value={on} />
        <SettingRow label="Address" value={mqtt.address} copy />
        <SettingRow label="Username" value={mqtt.username} copy />
        <SettingRow label="Password" value={mqtt.password} copy />
        <SettingRow label="Root topic" value={mqtt.rootTopic} hint={`${mqtt.rootTopic433} if you’re on 433 MHz`} copy />
        <SettingRow label="Encryption enabled" value={on} />
        <SettingRow label="JSON output" value={off} />
        <SettingRow label="TLS" value={off} />
        <SettingRow
          label="Proxy to client"
          value={proxy ? on : off}
          hint={proxy ? 'the phone app carries MQTT' : 'the node connects by itself'}
        />
      </Settings>
    </>
  );
}

/**
 * The radio side of MQTT (Join's one-tap link sets all of these).
 * OK to MQTT is what lets *other* nodes' gateways upload your packets;
 * uplink/downlink only take effect on a node that is itself a gateway.
 */
function RadioSettings({gateway}) {
  const onlyAsGateway = gateway ? undefined : 'only used if your node is a gateway';
  return (
    <>
      <Heading as="h3" className={styles.path}>
        Radio configuration → LoRa
      </Heading>
      <Settings>
        <SettingRow label="OK to MQTT" value={on} hint="lets gateways upload your messages" />
        <SettingRow label="Ignore MQTT" value={off} hint="so you receive messages from MQTT" />
      </Settings>
      <Heading as="h3" className={styles.path}>
        Radio configuration → Channels → primary channel (MediumFast)
      </Heading>
      <Settings>
        <SettingRow label="Uplink enabled" value={on} hint={onlyAsGateway} />
        <SettingRow label="Downlink enabled" value={on} hint={onlyAsGateway} />
      </Settings>
    </>
  );
}

function Method({title, badge, summary, children}) {
  return (
    <details className={styles.method}>
      <summary>
        <span className={styles.summaryText}>
          <span className={styles.methodTitle}>
            {title}
            {badge && <span className={styles.badge}>{badge}</span>}
          </span>
          <span className={styles.methodSummary}>{summary}</span>
        </span>
        <span className={styles.chev} aria-hidden="true" />
      </summary>
      <div className={styles.methodBody}>{children}</div>
    </details>
  );
}

export default function Mqtt() {
  return (
    <Layout
      title="MQTT setup"
      description="Connect your Meshtastic node to MeshMY's MQTT server: through a nearby gateway, through your phone, or over Wi-Fi, then check it works on Telegram.">
      <main className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <p className={styles.eyebrow}>MQTT</p>
            <Heading as="h1">Connect your node to MQTT</Heading>
            <p className={styles.lead}>
              MQTT links meshes over the internet. Messages that reach it can
              travel far beyond radio range, show up on the community map, and
              appear on MeshMY’s Telegram channel. There are three ways your
              node can get there: pick yours below.
            </p>
            <p className={styles.fine}>
              New to Meshtastic<sup>®</sup>? <Link to="/meshtastic/join">Set up your node first →</Link>{' '}
              Its one-tap settings already cover the first method.
            </p>
          </header>

          <section aria-labelledby="methods-heading">
            <Heading as="h2" id="methods-heading" className={styles.sectionTitle}>
              How does your node reach MQTT?
            </Heading>
            <div className={styles.methods}>
              <Method
                title="Through a nearby gateway"
                badge="Most people"
                summary="Your node sends by radio as usual; a gateway in range uploads your messages to MQTT.">
                <p>
                  Leave the MQTT module off. What matters is <strong>OK to MQTT</strong>:
                  it tells gateways they may upload your messages. A gateway in
                  radio range, on the same MediumFast channel, then does the rest.
                  The <Link to="/meshtastic/join">Join page</Link>’s one-tap settings
                  already set everything below.
                </p>
                <RadioSettings />
                <p className={styles.fine}>
                  This only works within radio range of a gateway. Check-in
                  message for the weekly net: <code>CRF</code>.
                </p>
              </Method>

              <Method
                title="Through your phone"
                badge="Bluetooth"
                summary="Your phone’s mobile data or Wi-Fi carries MQTT, while the Meshtastic app is connected to the node.">
                <p>
                  Good for a handheld you carry with your phone. The node only
                  reaches MQTT while the app is open and connected over
                  Bluetooth, and your phone has internet.
                </p>
                <RadioSettings gateway />
                <ServerSettings proxy />
                <p className={styles.fine}>
                  Check-in message for the weekly net: <code>CMQTT</code>.
                </p>
              </Method>

              <Method
                title="Through Wi-Fi"
                badge="ESP32 with Wi-Fi"
                summary="The node joins home Wi-Fi or a phone hotspot and connects to MQTT by itself.">
                <p>
                  Good for a node that stays put. Only <strong>ESP32</strong>-based
                  radios have Wi-Fi (for example Heltec V3, LilyGO T-Beam,
                  Station G2). nRF52 radios such as the Heltec T114, LilyGO
                  T-Echo, RAK4631 and SenseCAP P1 don’t.
                </p>
                <p>
                  <strong>Turning on Wi-Fi turns off Bluetooth</strong> on ESP32,
                  so the phone app can’t connect over Bluetooth afterwards. Set
                  everything else first; afterwards, manage the node over USB
                  or the network.
                </p>
                <Heading as="h3" className={styles.path}>
                  Radio configuration → Network
                </Heading>
                <Settings>
                  <SettingRow label="Wi-Fi enabled" value={on} />
                  <SettingRow label="SSID" value="(your Wi-Fi or hotspot name)" />
                  <SettingRow label="Password" value="(its password)" />
                </Settings>
                <RadioSettings gateway />
                <ServerSettings proxy={false} />
                <p className={styles.fine}>
                  Check-in message for the weekly net: <code>CMQTT</code>.
                </p>
              </Method>

              <Method
                title="LoRa only"
                badge="Radio only"
                summary="Disables MQTT: your messages stay within radio range.">
                <p>
                  This cuts you off from everyone beyond radio range, and from
                  the map and Telegram. Only choose it if you deliberately want
                  to stay off the internet.
                </p>
                <Heading as="h3" className={styles.path}>
                  Radio configuration → LoRa
                </Heading>
                <Settings>
                  <SettingRow label="OK to MQTT" value={off} />
                </Settings>
                <Heading as="h3" className={styles.path}>
                  Radio configuration → Channels → primary channel
                </Heading>
                <Settings>
                  <SettingRow label="Uplink enabled" value={off} />
                  <SettingRow label="Downlink enabled" value={off} />
                </Settings>
                <p className={styles.fine}>
                  Leave the MQTT module off. Check-in message for the weekly net:{' '}
                  <code>CRF</code>. With OK to MQTT off, gateways won’t upload it,
                  so it only counts if net control hears you directly by radio.
                </p>
              </Method>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="check-heading">
            <Heading as="h2" id="check-heading" className={styles.sectionTitle}>
              Check it works on Telegram
            </Heading>
            <div className={styles.check}>
              <ol className={styles.numbered}>
                <li>
                  Send a short message on the <strong>MediumFast</strong> channel.
                </li>
                <li>
                  Open MeshMY’s public Telegram channel,{' '}
                  <strong>{telegram.handle}</strong>. It relays messages that reach
                  MQTT.
                </li>
                <li>
                  <strong>If your message shows up there, your MQTT setup works.</strong>{' '}
                  Give it a minute or two.
                </li>
              </ol>
              <div className={styles.actions}>
                <a className={clsx('button', styles.quiet)} href={telegram.url} target="_blank" rel="noreferrer">
                  Open {telegram.handle} ↗
                </a>
                <a className={styles.getApp} href={telegram.getUrl} target="_blank" rel="noreferrer">
                  Get Telegram ↗
                </a>
              </div>
              <p className={styles.fine}>
                Anyone can follow the channel: install Telegram (free on Android,
                iOS and desktop), open the link and tap Join.
              </p>
            </div>

            <details className={styles.more}>
              <summary>
                My message didn’t show up
                <span className={styles.chev} aria-hidden="true" />
              </summary>
              <ul className={styles.list}>
                <li>
                  <strong>Every method:</strong> OK to MQTT and uplink are on, and
                  you sent on MediumFast (not the net channel or a direct message).
                </li>
                <li>
                  <strong>Through a gateway:</strong> no gateway may have heard you.
                  Check your message got a tick, then try from higher ground.
                </li>
                <li>
                  <strong>Through your phone:</strong> the app must stay connected to
                  the node, proxy to client on, and the phone online.
                </li>
                <li>
                  <strong>Through Wi-Fi:</strong> the node must have joined Wi-Fi
                  (check the network settings or the node’s screen), and proxy to
                  client off.
                </li>
              </ul>
              <p>
                You can also look for your node on the{' '}
                <a href="https://meshmap2.lucifernet.com/" target="_blank" rel="noreferrer">
                  community mesh map ↗
                </a>
                , which is fed from the same server.
              </p>
            </details>
          </section>

          <section className={styles.section} aria-labelledby="extras-heading">
            <Heading as="h2" id="extras-heading" className={styles.sectionTitle}>
              Good to know
            </Heading>
            <details className={styles.more}>
              <summary>
                Map reporting (optional)
                <span className={styles.chev} aria-hidden="true" />
              </summary>
              <p>
                In <strong>Module configuration → MQTT</strong>, map reporting
                publishes your node, and its position, to the public Meshtastic
                map. It’s off unless you turn it on and consent to share. If you
                do, set how precise a position you’re comfortable sharing.
              </p>
            </details>
            <details className={clsx(styles.more, styles['more--warn'])}>
              <summary>
                Using settings from an older guide?
                <span className={styles.chev} aria-hidden="true" />
              </summary>
              <p>
                Older community guides are written for <strong>LongFast</strong>. The
                mesh now uses <strong>MediumFast</strong>. In particular, don’t copy
                <strong> Frequency slot 16</strong> or <strong>Override frequency
                922.875&nbsp;MHz</strong>: they pin the radio to LongFast’s
                frequency, and it won’t hear anyone on MediumFast. Leave both at
                their defaults (0), and keep hop limit at 3.
              </p>
            </details>
          </section>

          <p className={clsx(styles.fine, styles.credit)}>
            Adapted from the community{' '}
            <a href={setupGuideSource.url} target="_blank" rel="noreferrer">
              {setupGuideSource.title} ↗
            </a>{' '}
            ({setupGuideSource.version}), {setupGuideSource.credits}. Updated for
            MediumFast.
          </p>
        </div>
      </main>
    </Layout>
  );
}
