import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function About() {
  return (
    <Layout
      title="About"
      description="About MeshMY, a community of Meshtastic mesh network enthusiasts.">
      <main className="container margin-vert--lg">
        <Heading as="h1">About MeshMY</Heading>
        <p>
          MeshMY is a community for people building and running{' '}
          <a href="https://meshtastic.org" target="_blank" rel="noreferrer">
            Meshtastic
          </a>{' '}
          mesh networks. We share node placements, coverage maps, hardware
          tips, and firmware know-how so anyone can get an off-grid mesh
          network up and running.
        </p>

        <Heading as="h2">What is Meshtastic?</Heading>
        <p>
          Meshtastic is an open source project that turns inexpensive
          LoRa radios into a long-range mesh network for text messaging
          and location sharing — no cell service or internet connection
          required.
        </p>

        <Heading as="h2">What we do</Heading>
        <ul>
          <li>Coordinate node placement to grow local mesh coverage</li>
          <li>Share hardware builds, antennas, and enclosures</li>
          <li>Host meetups and events for members to connect in person</li>
          <li>Help newcomers get their first node on the mesh</li>
        </ul>

        <Heading as="h2">Get involved</Heading>
        <p>
          Everyone is welcome, whether you're just curious about mesh
          networking or already running a node. Check out our{' '}
          <a href="/events">events page</a> for upcoming meetups, or find
          us on{' '}
          <a href="https://github.com/meshmy" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </main>
    </Layout>
  );
}
