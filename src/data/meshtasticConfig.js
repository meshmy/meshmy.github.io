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
  hours: '10:00 AM – 10:00 PM',
  checkIns: [
    {via: 'Over RF (relayed to MQTT by a gateway)', message: 'CRF CHECK IN NET MESH MY919'},
    {via: 'Directly on MQTT (your node is a gateway)', message: 'CMQTT CHECK IN NET MESH MY919'},
  ],
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

export const buildConfigUrl = (settings) =>
  `https://meshtastic.org/e/#${base64url(encodeChannelSet(settings))}`;

export const configUrl = buildConfigUrl(recommended);
export const configUrl433 = buildConfigUrl(recommended433);
