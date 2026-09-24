/**
 * MeshMY router sites — the single source of truth for both the homepage
 * network map and the Infrastructure page. Status is maintained by hand:
 * update a band's `status` ('active' | 'maintenance' | 'decommissioned')
 * and optional `statusNote` when a site changes.
 */

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

// Per-band status. `mark` is the .mm-marker variant it shows as.
export const STATUS = {
  active: {label: 'Online', mark: 'online'},
  maintenance: {label: 'Maintenance', mark: 'down'},
  decommissioned: {label: 'Decommissioned', mark: 'retired'},
};

export const sites = [
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

/**
 * RF links between router sites, as reported by each node's NeighborInfo
 * on meshmap2.lucifernet.com. A static snapshot (see LINKS_AS_OF) — refresh
 * it by hand when the topology changes. Pairs use `shortName`s.
 */
export const LINKS_AS_OF = '2026-09-24';
export const links = [
  ['BDKL', 'BBKL'],
  ['BDKL', 'BCPH'],
  ['BGKL', 'BDKL'],
  ['BGKL', 'BCPH'],
];

/** Metres with a fixed locale, so the build and the browser render the same text. */
export const formatMetres = (m) => m.toLocaleString('en-GB');

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
