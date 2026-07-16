import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

// Hardware product pages (manufacturer where available).
const SEEED_SENSECAP_P1 =
  'https://www.seeedstudio.com/SenseCAP-Solar-Node-P1-for-Meshtastic-LoRa-p-6425.html';
const HELTEC_WSL_V3 = 'https://heltec.org/project/wireless-stick-lite-v2/';
const HELTEC_T114 = 'https://heltec.org/project/mesh-node-t114/';
const GAT562 = 'https://www.aliexpress.com/item/1005009830660794.html';

// Antenna product pages: Taobao listings from the team's own equipment
// list where provided, otherwise the manufacturer's product page.
const RF_EXPLORER_919 =
  'https://www.seeedstudio.com/RF-Explorer-LoRa-Fiberglass-Antenna-Kit-902-928MHz-8dBi-1300mm-p-5278.html';
const ZIISOR_FIBERGLASS_919 = 'https://item.taobao.com/item.htm?id=650436686182';
const ZIISOR_FIBERGLASS_433 = 'https://item.taobao.com/item.htm?id=650462589156';
const ZIISOR_RUBBER_DUCKY_919 = 'https://www.ziisor.com/products/TX915-JKD-20/1';
const ZIISOR_RUBBER_DUCKY_433 = 'https://www.ziisor.com/products/TX433-JKD-20/1';

const STATUS = {
  active: {label: 'Online', badgeClass: 'badge--success'},
  maintenance: {label: 'Maintenance', badgeClass: 'badge--warning'},
  decommissioned: {label: 'Decomm', badgeClass: 'badge--danger'},
};

const sites = [
  {
    shortName: 'BDKL',
    name: 'Bukit Dinding',
    area: 'Kuala Lumpur',
    elevation: 340,
    grid: 'OJ03ve',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'Seeed Studio SenseCAP Solar Node P1',
        hardwareUrl: SEEED_SENSECAP_P1,
        antenna: '8 dBi omnidirectional, fiberglass',
        antennaPart: 'RF Explorer RFELA-5/8X9',
        antennaUrl: RF_EXPLORER_919,
      },
      {
        freq: '433 MHz',
        hardware: 'Heltec Wireless Stick Lite (WSL v3)',
        hardwareUrl: HELTEC_WSL_V3,
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor TX433-BLG-48',
        antennaUrl: ZIISOR_FIBERGLASS_433,
      },
    ],
    lat: 3.1904,
    lon: 101.7511,
    meshmapId: '3759327064',
  },
  {
    shortName: 'BGKL',
    name: 'Bukit Gasing',
    area: 'Petaling Jaya, Selangor',
    elevation: 170,
    grid: 'OJ03tc',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'Seeed Studio SenseCAP Solar Node P1',
        hardwareUrl: SEEED_SENSECAP_P1,
        antenna: '8 dBi omnidirectional, fiberglass',
        antennaPart: 'RF Explorer RFELA-5/8X9',
        antennaUrl: RF_EXPLORER_919,
        status: 'maintenance',
        statusNote: 'Node is offline and needs a physical visit.',
      },
      {
        freq: '433 MHz',
        hardware: 'Heltec Wireless Stick Lite (WSL v3)',
        hardwareUrl: HELTEC_WSL_V3,
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor TX433-BLG-48',
        antennaUrl: ZIISOR_FIBERGLASS_433,
      },
    ],
    lat: 3.0916,
    lon: 101.659,
    meshmapId: '729420782',
  },
  {
    shortName: 'BTSL',
    name: 'Bukit Tadun',
    area: 'Rawang, Selangor',
    elevation: 150,
    grid: 'OJ03sg',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'Seeed Studio SenseCAP Solar Node P1',
        hardwareUrl: SEEED_SENSECAP_P1,
        antenna: '9 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor TX915-BLG-85',
        antennaUrl: ZIISOR_FIBERGLASS_919,
        status: 'decommissioned',
        statusNote: 'Decommissioned due to lack of users.',
      },
      {
        freq: '433 MHz',
        hardware: 'Heltec Wireless Stick Lite (WSL v3)',
        hardwareUrl: HELTEC_WSL_V3,
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor TX433-BLG-48',
        antennaUrl: ZIISOR_FIBERGLASS_433,
        status: 'decommissioned',
        statusNote: 'Decommissioned due to lack of users.',
      },
    ],
    lat: 3.2531,
    lon: 101.5441,
    meshmapId: '2422982884',
  },
  {
    shortName: 'BBKL',
    name: 'Bukit Besi',
    area: 'Kuala Lumpur',
    elevation: 212,
    grid: 'OJ03ub',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'GAT562 Mesh Solar Relay',
        hardwareUrl: GAT562,
        antenna: '3 dBi omnidirectional, rubber ducky',
        antennaPart: 'Ziisor TX915-JKD-20',
        antennaUrl: ZIISOR_RUBBER_DUCKY_919,
      },
    ],
    lat: 3.0749,
    lon: 101.7334,
    meshmapId: '3959129294',
  },
  {
    shortName: 'BCPH',
    name: 'Bukit Cermin',
    area: 'Subang Jaya, Selangor',
    elevation: 203,
    grid: 'OJ03sa',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'Seeed Studio SenseCAP Solar Node P1',
        hardwareUrl: SEEED_SENSECAP_P1,
        antenna: '2 dBi omnidirectional, rubber ducky',
        antennaPart: 'Seeed Studio (stock antenna)',
      },
      {
        freq: '433 MHz',
        hardware: 'Heltec Wireless Stick Lite (WSL v3)',
        hardwareUrl: HELTEC_WSL_V3,
        antenna: '4 dBi omnidirectional, rubber ducky',
        antennaPart: 'Ziisor TX433-JKD-20',
        antennaUrl: ZIISOR_RUBBER_DUCKY_433,
      },
    ],
    lat: 3.0053,
    lon: 101.5765,
    meshmapId: '2769232366',
  },
  {
    shortName: 'GUK',
    name: 'Gunung Ulu Kali',
    area: 'Genting Highlands, Pahang',
    elevation: 1730,
    grid: 'OJ03vk',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'Heltec Mesh Node T114 v1 + D5 Solar',
        hardwareUrl: HELTEC_T114,
        antenna: '5.8 dBi omnidirectional, fiberglass',
        antennaPart: 'GT-BLG20-35-915',
      },
      {
        freq: '433 MHz',
        hardware: 'Heltec WSL v3 + D5 Solar',
        hardwareUrl: HELTEC_WSL_V3,
        antenna: '3.5 dBi omnidirectional, rubber ducky',
        antennaPart: 'Ziisor TX433-JKD-20',
      },
    ],
    lat: 3.4247,
    lon: 101.7896,
    meshmapId: '688514662',
  },
];

function googleMapsUrl(lat, lon) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

function meshmapUrl(nodeId) {
  return `https://meshmap2.lucifernet.com/?node_id=${nodeId}`;
}

export default function Infrastructure() {
  return (
    <Layout
      title="Infrastructure"
      description="Community-maintained Meshtastic router infrastructure operated by the MeshMY team.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--10 col--offset-1">
            <Heading as="h1">Infrastructure</Heading>
            <p>
              Beyond individual community nodes, the MeshMY team builds and
              maintains a small number of high-site routers to extend mesh
              coverage across the Klang Valley and beyond. These are
              volunteer-run, solar-powered installations at elevated sites.
            </p>

            <div className="row">
              {sites.map((site) => (
                <div className="col col--6 margin-bottom--lg" key={site.shortName}>
                  <div className="card" style={{height: '100%'}}>
                    <div className="card__header">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Heading as="h3" className="margin-bottom--none">
                          {site.name}
                        </Heading>
                        <code>{site.shortName}</code>
                      </div>
                      <p className="margin-bottom--none">
                        {site.area} · {site.elevation} m AMSL · Grid{' '}
                        {site.grid}
                      </p>
                    </div>
                    <div
                      className="card__body"
                      style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem'}}>
                      {site.bands.map((band) => {
                        const status = STATUS[band.status || 'active'];
                        return (
                          <div
                            key={band.freq}
                            style={{
                              flex: '1 1 200px',
                              border: '1px solid var(--ifm-color-emphasis-300)',
                              borderRadius: 'var(--ifm-card-border-radius)',
                              padding: '0.75rem',
                              background: 'var(--ifm-color-emphasis-100)',
                            }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem',
                              }}>
                              <strong>{band.freq}</strong>
                              <span className={`badge ${status.badgeClass}`}>
                                {status.label}
                              </span>
                            </div>
                            {band.statusNote && (
                              <p className="margin-bottom--sm">
                                <em>{band.statusNote}</em>
                              </p>
                            )}
                            <div
                              style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--ifm-color-emphasis-600)',
                              }}>
                              Hardware
                            </div>
                            <p className="margin-bottom--sm">
                              {band.hardwareUrl ? (
                                <a
                                  href={band.hardwareUrl}
                                  target="_blank"
                                  rel="noreferrer">
                                  {band.hardware} ↗
                                </a>
                              ) : (
                                band.hardware
                              )}
                            </p>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--ifm-color-emphasis-600)',
                              }}>
                              Antenna
                            </div>
                            <p className="margin-bottom--none">{band.antenna}</p>
                            <p className="margin-bottom--none">
                              {band.antennaUrl ? (
                                <a
                                  href={band.antennaUrl}
                                  target="_blank"
                                  rel="noreferrer">
                                  {band.antennaPart} ↗
                                </a>
                              ) : (
                                band.antennaPart
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="card__footer">
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <a
                          className="button button--secondary"
                          style={{flex: 1}}
                          href={googleMapsUrl(site.lat, site.lon)}
                          target="_blank"
                          rel="noreferrer">
                          Google Maps
                        </a>
                        <a
                          className="button button--secondary"
                          style={{flex: 1}}
                          href={meshmapUrl(site.meshmapId)}
                          target="_blank"
                          rel="noreferrer">
                          Mesh Map
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Heading as="h2">Get help</Heading>
            <p>
              Interested in helping build or maintain a site, or want to
              propose a new location? Check our{' '}
              <a href="/events">events page</a> for upcoming meetups, or
              browse the community's repositories on{' '}
              <a href="https://github.com/meshmy" target="_blank" rel="noreferrer">
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
