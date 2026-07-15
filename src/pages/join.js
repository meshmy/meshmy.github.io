import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

const CONFIG_REPO = 'https://github.com/meshmy/meshtastic-config-my-sg';
const CONFIG_RAW = 'https://raw.githubusercontent.com/meshmy/meshtastic-config-my-sg/main';

function ConfigLink({file}) {
  return (
    <>
      <a href={`${CONFIG_REPO}/blob/main/${file}`} target="_blank" rel="noreferrer">
        {file}
      </a>{' '}
      (<a href={`${CONFIG_RAW}/${file}`} target="_blank" rel="noreferrer">raw</a>)
    </>
  );
}

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

            <Heading as="h2">3. Choose your band</Heading>
            <p>MeshMY runs on two LoRa bands. Pick the one that matches your situation:</p>

            <div className="alert alert--info margin-bottom--md" role="alert">
              <strong>919 MHz (MY_919)</strong> — the license-free ISM band.
              This is the recommended default for everyone. Set your
              device's region to <code>MY_919</code>.
            </div>

            <div className="alert alert--warning margin-bottom--md" role="alert">
              <strong>433 MHz (MY_433)</strong> — this falls within Malaysia's
              amateur radio band. Only use <code>MY_433</code> if you hold a
              valid Malaysian amateur radio licence. If you're not a licensed
              ham operator, stick to 919 MHz.
            </div>

            <Heading as="h2">4. Import the MeshMY channel</Heading>
            <p>
              Rather than configuring settings by hand, import one of the
              community's ready-made channel configs from{' '}
              <a href={CONFIG_REPO} target="_blank" rel="noreferrer">
                meshtastic-config-my-sg
              </a>
              . Each band has three variants — pick based on how your node
              connects to the internet:
            </p>

            <Heading as="h3">Standard (recommended default)</Heading>
            <p>
              Use this if you're usually within RF range of other mesh
              nodes. MQTT is off on your own node, but the channel stays
              marked "OK to MQTT" so nearby gateway nodes can still bridge
              your messages onto the wider mesh.
            </p>
            <ul>
              <li><ConfigLink file="MY_919.yaml" /></li>
              <li><ConfigLink file="MY_433.yaml" /> (licensed operators only)</li>
            </ul>

            <Heading as="h3">MQTT Gateway / Client Proxy</Heading>
            <p>
              Use this if your node is often outside mesh coverage but has
              Wi-Fi or a phone with cellular data nearby. Your node connects
              directly to the community MQTT server, so you stay bridged to
              the rest of the mesh even without RF neighbors.
            </p>
            <ul>
              <li><ConfigLink file="MY_919_lucifernet_MQTT.yaml" /></li>
              <li><ConfigLink file="MY_433_lucifernet_MQTT.yaml" /> (licensed operators only)</li>
            </ul>

            <Heading as="h3">RF-only</Heading>
            <p>
              Use this only if you deliberately want your traffic to stay
              off MQTT entirely.
            </p>
            <div className="alert alert--danger margin-bottom--md" role="alert">
              <strong>Not recommended.</strong> Going RF-only prevents your
              messages from being linked over MQTT to nodes out-of-state.
              Unless you have a specific reason to isolate your traffic to
              local RF range, use the Standard or MQTT Gateway config above
              instead.
            </div>
            <ul>
              <li><ConfigLink file="MY_919_RF_only.yaml" /></li>
              <li><ConfigLink file="MY_433_RF_only.yaml" /> (licensed operators only)</li>
            </ul>

            <Heading as="h3">Applying a config</Heading>
            <p>
              Easiest: open the channel's <code>channel_url</code> from the
              yaml file on your phone (or scan its QR code) to import it
              directly in the Meshtastic app under{' '}
              <em>Settings → Channels</em>.
            </p>
            <p>
              Or, using the{' '}
              <a
                href="https://meshtastic.org/docs/software/python/cli/installation/"
                target="_blank"
                rel="noreferrer">
                Meshtastic Python CLI
              </a>
              :
            </p>
            <CodeBlock language="bash">
              {'meshtastic [-t tcp_node_ip/hostname] [-s com_port/tty_device] --configure MY_919.yaml'}
            </CodeBlock>

            <Heading as="h2">5. About the MQTT server</Heading>
            <p>
              <a href="https://mqtt.lucifernet.com" target="_blank" rel="noreferrer">
                mqtt.lucifernet.com
              </a>{' '}
              is MeshMY's preferred community MQTT server (maintained by
              9W2LWK). It's already set in the MQTT Gateway configs above. If
              you're setting it up manually, use:
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
              is uplinking to it, you'll show up at{' '}
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
