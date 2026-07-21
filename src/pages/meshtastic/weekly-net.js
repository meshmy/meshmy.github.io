import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function WeeklyNet() {
  return (
    <Layout
      title="Weekly Net"
      description="MeshMY's weekly Check In Net Mesh MY919, and how to set up the net's secondary channel.">
      <main className="container margin-vert--lg">
        <Heading as="h1">Weekly Net</Heading>
        <p>
          MeshMY runs a weekly check-in net on MY919 — "Check In Net Mesh
          MY919". Check-ins are open from{' '}
          <strong>10:00 AM to 10:00 PM</strong>.
        </p>

        <Heading as="h2">Set up the net's secondary channel</Heading>
        <p>
          The weekly net runs on its own secondary channel, kept
          separate from the primary default channel you set up in{' '}
          <a href="/meshtastic/join">Join the Mesh</a>, so net traffic
          doesn't clutter everyone's day-to-day channel. To add it:
        </p>
        <ol>
          <li>
            Open <em>Settings → Channels</em> in the Meshtastic app (see
            the official{' '}
            <a
              href="https://meshtastic.org/docs/configuration/radio/channels/"
              target="_blank"
              rel="noreferrer">
              Channels
            </a>{' '}
            docs for background on primary vs. secondary channels).
          </li>
          <li>
            Tap <strong>Add Channel</strong>, then import the net
            channel by scanning its QR code or pasting its channel URL —
            net control shares this ahead of each net; check with the
            community if you don't have it yet.
          </li>
          <li>
            Save and enable the channel. It'll appear alongside your
            primary channel, and you can select it when sending your
            check-in message.
          </li>
        </ol>
        <p>
          Because it's a secondary channel, it doesn't affect your
          primary channel's region, modem preset, or MQTT settings —
          it's purely an additional, separately-keyed channel for net
          traffic.
        </p>

        <Heading as="h2">How to check in</Heading>
        <p>Send one of the following messages to check in:</p>
        <ul>
          <li>
            <code>CMQTT CHECK IN NET MESH MY919</code> — if your node is
            connected directly to MQTT (e.g. running as its own gateway).
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
          New to the mesh? Start with{' '}
          <a href="/meshtastic/join">Join the Mesh</a> first. For
          anything else, check our <a href="/events">events page</a> or
          browse the community's repositories on{' '}
          <a href="https://github.com/meshmy" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </main>
    </Layout>
  );
}
