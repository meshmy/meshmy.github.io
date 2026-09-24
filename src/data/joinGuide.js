/**
 * Content for the interactive Join page (src/pages/meshtastic/join.js):
 * the setup questions, glossary, pairing tips and troubleshooting.
 * Kept here so the page is layout and the words are easy to edit.
 */

// "Your setup" questions. The first option of each is the default, which is
// also what renders at build time (and without JS).
export const questions = [
  {
    id: 'hasRadio',
    label: 'Do you have a Meshtastic radio yet?',
    options: [
      {value: 'no', label: 'Not yet'},
      {value: 'yes', label: 'Yes, I have one'},
    ],
  },
  {
    id: 'platform',
    label: 'What will you set it up from?',
    options: [
      {value: 'android', label: 'Android phone'},
      {value: 'ios', label: 'iPhone'},
      {value: 'web', label: 'Computer'},
    ],
  },
  {
    id: 'licensed',
    label: 'Do you hold a Malaysian amateur radio licence?',
    options: [
      {value: 'no', label: 'No'},
      {value: 'yes', label: 'Yes'},
    ],
  },
];

// Short definitions for <Term>, and the "Words you'll meet" list.
export const glossary = {
  lora: {term: 'LoRa', text: 'Long-range, low-power radio. It carries short text messages for kilometres, with no SIM or internet.'},
  node: {term: 'Node', text: 'Any Meshtastic radio on the mesh: yours, a friend’s, or a hilltop router.'},
  mesh: {term: 'Mesh', text: 'Nodes pass each other’s messages along, so a message can hop far beyond one radio’s range.'},
  region: {term: 'Region', text: 'Which frequency band your radio uses. In Malaysia that’s MY_919 (anyone) or MY_433 (licensed hams only).'},
  preset: {term: 'Modem preset', text: 'A bundle of radio settings trading range for speed. Everyone on a mesh must use the same one: MeshMY uses Medium Fast.'},
  channel: {term: 'Channel', text: 'A group chat on the mesh. The default primary channel is named after the preset (“MediumFast”).'},
  psk: {term: 'PSK', text: 'The channel’s encryption key. Leave the default so you can talk to everyone on the public channel.'},
  hops: {term: 'Hops', text: 'How many times a message may be relayed. The default of 3 suits most people.'},
  mqtt: {term: 'MQTT', text: 'An internet link between meshes. Gateways bridge radio messages to it, so you can reach nodes far out of radio range.'},
  gateway: {term: 'Gateway', text: 'A node with internet access that relays messages between the radio mesh and MQTT.'},
  uplink: {term: 'Uplink / downlink', text: 'Channel switches that let gateways send your messages up to MQTT, and bring MQTT messages down to you.'},
};

// Step 2: what pairing looks like, per platform.
export const pairing = {
  android: [
    'Turn on Bluetooth and open the Meshtastic app.',
    'Tap the + (or Connect) button and pick your radio from the list.',
    'Enter the PIN shown on the radio’s screen. Radios without a screen use 123456.',
  ],
  ios: [
    'Turn on Bluetooth and open the Meshtastic app.',
    'Go to Bluetooth in the app and pick your radio from the list.',
    'Enter the PIN shown on the radio’s screen. Radios without a screen use 123456.',
  ],
  web: [
    'Use Chrome or Edge: the web app needs Web Serial or Web Bluetooth, which Firefox and Safari don’t have.',
    'Plug the radio in with a USB data cable (some cables are charge-only), or use Bluetooth.',
    'Open client.meshtastic.org, choose New connection, and pick your radio.',
  ],
};

// Step 5 and the troubleshooting list.
export const troubleshooting = [
  {
    q: 'No other nodes show up',
    a: 'Nodes announce themselves every so often, so give it 15–30 minutes. Check the region is MY_919 and the preset is Medium Fast. Then get higher or near a window: LoRa needs line of sight, and walls and hills block it. The network map on the homepage shows where the routers are.',
  },
  {
    q: 'The app says the region is unset',
    a: 'New radios ship with no region and won’t transmit until one is set. Apply the one-tap settings in step 3, or set Region to MY_919 by hand.',
  },
  {
    q: 'My messages don’t get a tick',
    a: 'A tick means another node acknowledged the message. No tick usually means no node heard you. Check the region and preset, and try from higher ground. If you’re out of radio range, a gateway (step 4) can carry your messages over MQTT.',
  },
  {
    q: 'I can’t pair the radio',
    a: 'Turn Bluetooth off and on, restart the radio, and remove any old pairing for it in your phone’s Bluetooth settings. On a computer, try another USB cable: many are charge-only.',
  },
  {
    q: 'I’m not on the community map',
    a: 'The map only shows nodes that reach MQTT, either through a nearby gateway or as your own gateway. Check OK to MQTT and uplink are on, then allow up to an hour.',
  },
];
