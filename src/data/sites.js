/**
 * Community router sites — the single source of truth for both the homepage
 * network map and the Infrastructure page. Status is maintained by hand:
 * update a band's `status` ('active' | 'maintenance' | 'decommissioned')
 * and optional `statusNote` when a site changes.
 *
 * A band's optional `power` is its transmit power class (e.g. '1 W').
 * `maintainer` is a key of MAINTAINERS. `UNKNOWN` marks details we don't
 * have yet; `approx: true` marks a position and elevation taken from what
 * the node itself reports (its position is deliberately imprecise).
 */

// Hardware product pages (manufacturer where available).
const SEEED_SENSECAP_P1 =
  'https://www.seeedstudio.com/SenseCAP-Solar-Node-P1-for-Meshtastic-LoRa-p-6425.html';
const HELTEC_WSL_V3 = 'https://heltec.org/project/wireless-stick-lite-v2/';
const HELTEC_T114 = 'https://heltec.org/project/mesh-node-t114/';
const RAK4631 = 'https://store.rakwireless.com/products/rak4631-lpwan-node';
const GAT562 = 'https://www.aliexpress.com/item/1005009830660794.html';

// Antenna product pages: Taobao listings from the team's own equipment
// list where provided, otherwise the manufacturer's product page.
const RF_EXPLORER_919 =
  'https://www.seeedstudio.com/RF-Explorer-LoRa-Fiberglass-Antenna-Kit-902-928MHz-8dBi-1300mm-p-5278.html';
const ZIISOR_FIBERGLASS_919 = 'https://item.taobao.com/item.htm?id=650436686182';
const ZIISOR_FIBERGLASS_433 = 'https://item.taobao.com/item.htm?id=650462589156';
const ZIISOR_RUBBER_DUCKY_919 = 'https://www.ziisor.com/products/TX915-JKD-20/1';
const ZIISOR_RUBBER_DUCKY_433 = 'https://www.ziisor.com/products/TX433-JKD-20/1';

/** Shown for details a site's maintainers haven't shared yet. */
export const UNKNOWN = '?';

// `heading` titles the maintainer's group on Infrastructure (default: `name`).
export const MAINTAINERS = {
  meshmy: {name: 'MeshMY', heading: 'Klang Valley'},
  penang: {name: 'Penang Meshtastic community'},
};

/** Who looks after a site; MeshMY unless the site says otherwise. */
export const maintainerOf = (site) => MAINTAINERS[site.maintainer] ?? MAINTAINERS.meshmy;

// Per-band status. `mark` is the .mm-marker variant it shows as.
export const STATUS = {
  active: {label: 'Online', mark: 'online'},
  maintenance: {label: 'Maintenance', mark: 'down'},
  decommissioned: {label: 'Decommissioned', mark: 'retired'},
};

export const sites = [
  {
    shortName: 'BDKL',
    maintainer: 'meshmy',
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
    maintainer: 'meshmy',
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
    maintainer: 'meshmy',
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
    maintainer: 'meshmy',
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
    maintainer: 'meshmy',
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
    maintainer: 'meshmy',
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
  // Penang: the PG-RTR-* routers. Positions and elevations are as the nodes
  // report them to meshmap2.lucifernet.com (2026-09-24); hardware, antennas
  // and power are from the Penang community. All are 919 MHz only.
  {
    shortName: 'PGCH',
    maintainer: 'penang',
    name: 'Carpet Hill',
    area: 'Penang Island',
    elevation: 410,
    grid: 'OJ05dh',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'RAK WisBlock RAK4631',
        hardwareUrl: RAK4631,
        power: '1 W',
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor',
      },
    ],
    lat: 5.3281,
    lon: 100.2504,
    approx: true,
    meshmapId: '4244836625',
  },
  {
    shortName: 'PGJB',
    maintainer: 'penang',
    name: 'Bukit Jambul',
    area: 'Penang Island',
    elevation: 235,
    grid: 'OJ05di',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'RAK WisBlock RAK4631',
        hardwareUrl: RAK4631,
        power: '1 W',
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor',
      },
    ],
    lat: 5.3412,
    lon: 100.2897,
    approx: true,
    meshmapId: '4072757313',
  },
  {
    shortName: 'PGFH',
    maintainer: 'penang',
    name: 'Fortress Hill',
    area: 'Penang Island',
    elevation: 517,
    grid: 'OJ05di',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'RAK WisBlock RAK4631',
        hardwareUrl: RAK4631,
        power: '1 W',
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor',
      },
    ],
    lat: 5.3674,
    lon: 100.2635,
    approx: true,
    meshmapId: '957121554',
  },
  {
    shortName: '19ad',
    maintainer: 'penang',
    name: 'Bukit Hijau (NW)',
    area: 'Penang Island',
    elevation: 200,
    grid: 'OJ05dj',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'nRF52 Pro Micro (DIY)',
        power: 'milliwatt',
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor',
      },
    ],
    lat: 5.3887,
    lon: 100.2914,
    approx: true,
    meshmapId: '1623857581',
  },
  {
    shortName: 'a1a3',
    maintainer: 'penang',
    name: 'Pearl Hill (S)',
    area: 'Penang Island',
    elevation: 209,
    grid: 'OJ05dl',
    bands: [
      {
        freq: '919 MHz',
        hardware: 'nRF52 Pro Micro (DIY)',
        power: 'milliwatt',
        antenna: '4 dBi omnidirectional, fiberglass',
        antennaPart: 'Ziisor',
      },
    ],
    lat: 5.4608,
    lon: 100.2947,
    approx: true,
    meshmapId: '3563626915',
  },
];

/**
 * RF links between router sites, as reported on meshmap2.lucifernet.com by
 * each node's NeighborInfo and by traceroutes (its /api/v1/links). A static
 * snapshot (see LINKS_AS_OF) — refresh it by hand when the topology
 * changes. Pairs use `shortName`s.
 */
export const LINKS_AS_OF = '2026-09-24';
export const links = [
  ['BDKL', 'BBKL'],
  ['BDKL', 'BCPH'],
  ['BGKL', 'BDKL'],
  ['BGKL', 'BCPH'],
  ['19ad', 'a1a3'],
  ['19ad', 'PGFH'],
  ['PGJB', 'PGFH'],
];

/** Metres with a fixed locale, so the build and the browser render the same text. */
export const formatMetres = (m) => m.toLocaleString('en-GB');

/** A site's elevation, e.g. "340 m", or "≈ 410 m" when it's approximate. */
export const siteElevation = (site) =>
  `${site.approx ? '≈ ' : ''}${formatMetres(site.elevation)} m`;

export function googleMapsUrl(lat, lon) {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

export function meshmapUrl(nodeId) {
  return `https://meshmap2.lucifernet.com/?node_id=${nodeId}`;
}

/**
 * Roll a site's per-band statuses up into one site-level status:
 *   'online'  — every band that isn't decommissioned is active
 *   'partial' — at least one band active, at least one in maintenance
 *   'down'    — nothing active, at least one band in maintenance
 *   'retired' — every band decommissioned
 */
export function siteStatus(site) {
  const s = site.bands.map((b) => b.status || 'active');
  const live = s.filter((x) => x !== 'decommissioned');
  if (live.length === 0) return 'retired';
  const active = live.filter((x) => x === 'active').length;
  if (active === live.length) return 'online';
  if (active > 0) return 'partial';
  return 'down';
}

export const SITE_STATUS = {
  online: {label: 'Online'},
  partial: {label: 'Partly online'},
  down: {label: 'Offline'},
  retired: {label: 'Decommissioned'},
};
