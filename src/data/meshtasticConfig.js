/**
 * MeshMY's recommended Meshtastic settings, and the one-tap config link
 * built from them.
 *
 * The link is a standard Meshtastic "channel URL" (meshtastic.org/e/#...):
 * a base64url-encoded `ChannelSet` protobuf holding the primary channel and
 * the LoRa config. Opening it in the Meshtastic app (or scanning its QR
 * code) applies both in one go. It REPLACES the node's channels and LoRa
 * settings, which is what a newcomer wants.
 *
 * Field numbers come from meshtastic/protobufs (apponly.proto,
 * channel.proto, config.proto). Only the fields we set are encoded;
 * everything else stays at the firmware default.
 */

// config.proto → Config.LoRaConfig.RegionCode / ModemPreset
const REGION = {MY_433: 16, MY_919: 17};
const MODEM_PRESET = {MEDIUM_FAST: 4};

export const recommended = {
  region: 'MY_919',
  regionLabel: '919 MHz (MY_919)',
  modemPreset: 'MEDIUM_FAST',
  modemPresetLabel: 'Medium Fast',
  channelName: '', // blank → the app names it after the preset, "MediumFast"
  channelDisplayName: 'MediumFast',
  hopLimit: 3,
  okToMqtt: true,
  uplink: true,
  downlink: true,
  // Share an approximate position (~1.5 km) on the public default channel
  // rather than an exact one. 32 = exact, 0 = don't share.
  positionPrecision: 14,
};

// Licensed amateur radio operators only: the same settings on 433 MHz.
export const recommended433 = {
  ...recommended,
  region: 'MY_433',
  regionLabel: '433 MHz (MY_433)',
};

export const mqtt = {
  address: 'mqtt.lucifernet.com',
  username: 'meshdev',
  password: 'large4cats',
  rootTopic: 'msh/MY_919',
  rootTopic433: 'msh/MY_433',
};

// Official Meshtastic apps. `id` matches the Join page's platform answer.
export const apps = [
  {id: 'android', label: 'Android', href: 'https://play.google.com/store/apps/details?id=com.geeksville.mesh'},
  {id: 'ios', label: 'iOS', href: 'https://apps.apple.com/us/app/meshtastic/id1586432531'},
  {id: 'web', label: 'Web', href: 'https://client.meshtastic.org/'},
];

export const weeklyNet = {
  name: 'Check In Net Mesh MY919',
  tagline: 'Jom check in net! Kalau bukan anda, siapa lagi.',
  taglineEnglish: 'Come check in to the net. If not you, then who else?',
  // Every Wednesday, 10:00–22:00 Malaysia time (MYT, UTC+8, no DST).
  day: 'Wednesday',
  weekday: 3, // 0 = Sunday
  opensHour: 10,
  closesHour: 22,
  utcOffsetHours: 8,
  hours: '10:00 AM – 10:00 PM',
  // MESH NET919: the community site that tracks the weekly check-ins.
  trackerUrl: 'https://sites.google.com/view/mesh-net919/home',
  checkIns: [
    {
      id: 'rf',
      via: 'Over RF (relayed to MQTT by a gateway)',
      label: 'Through another node (RF)',
      message: 'CRF CHECK IN NET MESH MY919',
    },
    {
      id: 'mqtt',
      via: 'Directly on MQTT (your node is a gateway)',
      label: 'My node is its own gateway (MQTT)',
      message: 'CMQTT CHECK IN NET MESH MY919',
    },
  ],
};

// The net's public secondary channel. `psk` is the key as base64, as the app
// shows it. Uplink and downlink are on unless set to false, so check-ins
// reach MQTT through gateways. This drives the one-tap "add channel" link
// and QR on the Weekly Net page; set it to null and the page tells people
// to get the channel from net control instead.
export const netChannel = {
  name: 'Mesh_Net919',
  psk: 'AQ==', // Meshtastic's well-known default key: a public channel
};

// --- minimal protobuf writer ------------------------------------------------

function varint(n) {
  const out = [];
  while (n > 0x7f) {
    out.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }
  out.push(n);
  return out;
}
const key = (field, wire) => varint((field << 3) | wire);
const vField = (field, value) => [...key(field, 0), ...varint(value)];
const bField = (field, bytes) => [...key(field, 2), ...varint(bytes.length), ...bytes];

function encodeChannelSet(c) {
  const moduleSettings = vField(1, c.positionPrecision);
  const channel = [
    ...bField(2, [0x01]), // psk: 0x01 = the well-known default key ("AQ==")
    ...bField(3, [...new TextEncoder().encode(c.channelName)]),
    ...(c.uplink ? vField(5, 1) : []),
    ...(c.downlink ? vField(6, 1) : []),
    ...bField(7, moduleSettings),
  ];
  const lora = [
    ...vField(1, 1), // use_preset
    ...vField(2, MODEM_PRESET[c.modemPreset]),
    ...vField(7, REGION[c.region]),
    ...vField(8, c.hopLimit),
    ...vField(9, 1), // tx_enabled
    ...vField(13, 1), // sx126x_rx_boosted_gain
    ...(c.okToMqtt ? vField(105, 1) : []), // config_ok_to_mqtt
  ];
  return [...bField(1, channel), ...bField(2, lora)];
}

function base64url(bytes) {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const b64 =
    typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// A link that ADDS channels (as secondary) and leaves the node's LoRa
// settings and primary channel alone: ChannelSet with settings only, and
// `?add=true`. `channel.psk` is base64.
function fromBase64(input) {
  // Accept base64url and stray whitespace from copy-pasting.
  const b64 = input.trim().replace(/-/g, '+').replace(/_/g, '/');
  const bin = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  return [...bin].map((c) => c.charCodeAt(0));
}
function encodeChannel(ch) {
  const psk = fromBase64(ch.psk);
  return [
    ...bField(2, psk),
    ...bField(3, [...new TextEncoder().encode(ch.name)]),
    ...(ch.uplink !== false ? vField(5, 1) : []),
    ...(ch.downlink !== false ? vField(6, 1) : []),
  ];
}
export const buildAddChannelUrl = (channel) =>
  `https://meshtastic.org/e/?add=true#${base64url(bField(1, encodeChannel(channel)))}`;

export const buildConfigUrl = (settings) =>
  `https://meshtastic.org/e/#${base64url(encodeChannelSet(settings))}`;

export const configUrl = buildConfigUrl(recommended);
export const configUrl433 = buildConfigUrl(recommended433);
