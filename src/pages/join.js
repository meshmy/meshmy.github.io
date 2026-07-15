import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function Join() {
  return (
    <Layout
      title="Join the Mesh"
      description="How to get on the MeshMY Meshtastic network: hardware, apps, channel configs, and the weekly net.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h1">Join the Mesh</Heading>
            <p>
              This guide walks you through getting a{' '}
              <a href="https://meshtastic.org" target="_blank" rel="noreferrer">
                Meshtastic
              </a>{' '}
              node on the air and onto the MeshMY community mesh in Malaysia.
              No amateur radio licence is required to get started on the
              919 MHz band — anyone can join.
            </p>

            <Heading as="h2">1. Get a device</Heading>
            <p>
              Meshtastic runs on inexpensive LoRa radios. Pick anything from
              the official{' '}
              <a
                href="https://meshtastic.org/docs/hardware/devices/"
                target="_blank"
                rel="noreferrer">
                supported hardware list
              </a>{' '}
              — a simple handheld unit (e.g. a Heltec, T-Echo, or RAK) is a
              great first node.
            </p>

            <Heading as="h2">2. Install the app</Heading>
            <p>Install the official Meshtastic client for your platform:</p>
            <ul>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.geeksville.mesh"
                  target="_blank"
                  rel="noreferrer">
                  Android
                </a>
              </li>
              <li>
                <a
                  href="https://apps.apple.com/us/app/meshtastic/id1586432531"
                  target="_blank"
                  rel="noreferrer">
                  iOS
                </a>
              </li>
              <li>
                <a href="https://client.meshtastic.org/" target="_blank" rel="noreferrer">
                  Web (Chrome/Edge, via USB or Bluetooth)
                </a>
              </li>
            </ul>
            <p>
              Pair your device over Bluetooth or USB and complete the initial
              setup, then come back here for the MeshMY-specific settings
              below.
            </p>

            <Heading as="h2">3. Radio Configuration → LoRa</Heading>
            <p>
              Open your device's{' '}
              <a
                href="https://meshtastic.org/docs/configuration/radio/lora/"
                target="_blank"
                rel="noreferrer">
                LoRa settings
              </a>{' '}
              and set the following:
            </p>

            <div className="alert alert--info margin-bottom--md" role="alert">
              <strong>Region: 919 MHz (MY_919)</strong> — the license-free
              ISM band. This is the recommended default for everyone. See
              the full{' '}
              <a
                href="https://meshtastic.org/docs/configuration/region-by-country/"
                target="_blank"
                rel="noreferrer">
                region by country
              </a>{' '}
              list for reference.
            </div>

            <div className="alert alert--warning margin-bottom--md" role="alert">
              <strong>Region: 433 MHz (MY_433)</strong> — this falls within
              Malaysia's amateur radio band. Only select it if you hold a
              valid Malaysian amateur radio licence. If you're not a licensed
              ham operator, use 919 MHz instead.
            </div>

            <p>Also on this page:</p>
            <ul>
              <li>
                Set <strong>Modem Preset</strong> to <code>Medium Fast</code>{' '}
                — this is the preset the rest of the MeshMY community uses,
                so staying on it keeps you compatible with everyone else's
                mesh timing.
              </li>
              <li>
                Leave <strong>Max Hops</strong> at its default of{' '}
                <code>3</code>, which is fine for most setups.
              </li>
              <li>
                Turn on <strong>OK to MQTT</strong>. This tells nearby
                gateway nodes they're allowed to bridge your packets onto
                MQTT — see the note on MQTT below for why this matters.
              </li>
            </ul>

            <Heading as="h2">4. Radio Configuration → Channels</Heading>
            <p>
              Open your{' '}
              <a
                href="https://meshtastic.org/docs/configuration/radio/channels/"
                target="_blank"
                rel="noreferrer">
                Channels settings
              </a>{' '}
              and leave the primary channel's name field blank and its PSK
              at the default. With the name blank, the channel is named
              automatically after your modem preset — <code>MediumFast</code>{' '}
              per step 3 above. Don't create a custom channel or change the
              PSK; staying on this default channel is what puts you on the
              air with the rest of the MeshMY community.
            </p>
            <p>
              On that same primary channel, turn on <strong>Uplink
              Enabled</strong> and <strong>Downlink Enabled</strong>. These
              work together with "OK to MQTT" above to let your messages
              flow to and from MQTT gateways.
            </p>

            <Heading as="h2">5. Module Configuration → MQTT</Heading>
            <p>
              Meshtastic's{' '}
              <a
                href="https://meshtastic.org/docs/configuration/module/mqtt/"
                target="_blank"
                rel="noreferrer">
                MQTT module
              </a>{' '}
              controls whether your node talks to an MQTT broker directly.
              There are two reasonable ways to set this up, depending on how
              your node connects to the internet:
            </p>
            <ul>
              <li>
                <strong>Rely on a nearby gateway (recommended default).</strong>{' '}
                Leave the MQTT module disabled on your own node. As long as
                "OK to MQTT" and the channel's uplink/downlink toggles are
                on (steps 3–4 above), any MeshMY gateway node within RF range
                will bridge your messages for you.
              </li>
              <li>
                <strong>Be your own gateway.</strong> If your node is often
                out of RF range but has Wi-Fi or a phone with cellular data
                nearby, enable the MQTT module directly and point it at
                MeshMY's community server — see below.
              </li>
            </ul>
            <div className="alert alert--danger margin-bottom--md" role="alert">
              <strong>Not recommended:</strong> turning off both "OK to
              MQTT" and the module (an "RF-only" setup). This isolates your
              traffic to local RF range only and prevents it from being
              linked over MQTT to nodes out-of-state. Only do this if you
              deliberately want to stay off MQTT entirely.
            </div>

            <Heading as="h3">MeshMY's community MQTT server</Heading>
            <p>
              <a href="https://mqtt.lucifernet.com" target="_blank" rel="noreferrer">
                mqtt.lucifernet.com
              </a>{' '}
              is MeshMY's preferred MQTT server (maintained by 9W2LWK). If
              you're setting up the MQTT module yourself, use:
            </p>
            <ul>
              <li>Address: <code>mqtt.lucifernet.com</code></li>
              <li>Username: <code>meshdev</code></li>
              <li>Password: <code>large4cats</code></li>
              <li>Root topic: <code>msh/MY_919</code> (or <code>msh/MY_433</code>)</li>
              <li>Encryption: enabled</li>
            </ul>
            <p>
              This server also feeds the community mesh map — once your node
              is uplinking to it (whether directly or via a nearby gateway),
              you'll show up at{' '}
              <a href="https://meshmap2.lucifernet.com/" target="_blank" rel="noreferrer">
                meshmap2.lucifernet.com
              </a>
              .
            </p>

            <Heading as="h2">6. Join the weekly net</Heading>
            <p>
              MeshMY runs a weekly check-in net on MY919 — "Check In Net Mesh
              MY919". Check-ins are open from <strong>10:00 AM to 10:00 PM</strong>.
              Send one of the following messages on the default channel to
              check in:
            </p>
            <ul>
              <li>
                <code>CMQTT CHECK IN NET MESH MY919</code> — if your node is
                connected directly to MQTT (e.g. the MQTT Gateway config).
              </li>
              <li>
                <code>CRF CHECK IN NET MESH MY919</code> — if you're checking
                in over RF and relying on another node to relay you to MQTT.
              </li>
            </ul>
            <p>
              <em>Jom check in net! Kalau bukan anda, siapa lagi.</em>{' '}
              ("Come check in to the net — if not you, then who else.")
            </p>

            <Heading as="h2">Get help</Heading>
            <p>
              Questions, node placement help, or just want to say hi? Check
              our <a href="/events">events page</a> for upcoming meetups, browse
              the community's repositories on{' '}
              <a href="https://github.com/meshmy" target="_blank" rel="noreferrer">
                GitHub
              </a>
              , or read more on the <a href="/about">About page</a>.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
