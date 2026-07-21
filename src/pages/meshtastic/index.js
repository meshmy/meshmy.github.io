import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

export default function Meshtastic() {
  return (
    <Layout
      title="Meshtastic"
      description="Meshtastic at MeshMY: how to join the mesh and take part in the weekly net.">
      <main className="container margin-vert--lg">
        <Heading as="h1">Meshtastic</Heading>
        <p>
          MeshMY runs on{' '}
          <a href="https://meshtastic.org" target="_blank" rel="noreferrer">
            Meshtastic
          </a>
          , an open source project that turns inexpensive LoRa radios into
          a long-range mesh network for text messaging and location
          sharing — no cell service or internet connection required.
        </p>
        <p>Start here:</p>

        <div className="row margin-top--lg">
          <div className="col col--3 margin-bottom--md">
                <div className="card">
                  <div className="card__header">
                    <Heading as="h2">Join</Heading>
                  </div>
                  <div className="card__body">
                    <p>
                      Get a device, install the app, and configure it to get
                      on the air with the MeshMY community.
                    </p>
                  </div>
                  <div className="card__footer">
                    <Link className="button button--secondary button--block" to="/meshtastic/join">
                      Join the mesh
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col col--3 margin-bottom--md">
                <div className="card">
                  <div className="card__header">
                    <Heading as="h2">Weekly Net</Heading>
                  </div>
                  <div className="card__body">
                    <p>
                      Already on the mesh? Take part in the weekly check-in
                      net on MY919.
                    </p>
                  </div>
                  <div className="card__footer">
                    <Link className="button button--secondary button--block" to="/meshtastic/weekly-net">
                      Weekly net details
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col col--3 margin-bottom--md">
                <div className="card">
                  <div className="card__header">
                    <Heading as="h2">Infrastructure</Heading>
                  </div>
                  <div className="card__body">
                    <p>
                      See the router sites the MeshMY team builds and
                      maintains to extend mesh coverage.
                    </p>
                  </div>
                  <div className="card__footer">
                    <Link className="button button--secondary button--block" to="/meshtastic/infrastructure">
                      View infrastructure
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col col--3 margin-bottom--md">
                <div className="card">
                  <div className="card__header">
                    <Heading as="h2">Foliage Calculator</Heading>
                  </div>
                  <div className="card__body">
                    <p>
                      Estimate usable link range through vegetation for your
                      radio and LoRa modem preset.
                    </p>
                  </div>
                  <div className="card__footer">
                    <Link className="button button--secondary button--block" to="/meshtastic/foliage-calculator">
                      Open calculator
                    </Link>
                  </div>
                </div>
              </div>
        </div>
      </main>
    </Layout>
  );
}
