/**
 * Content for the Buying guide (src/pages/meshtastic/buying-guide.js): the
 * picked radios, the "Find your radio" questions and rules, and the words
 * for each section. Kept here so the page is layout and the facts are easy
 * to re-check.
 *
 * Specs are from each maker's product page, checked against Meshtastic's
 * hardware docs (meshtastic.org/docs/hardware/devices/) in September 2026.
 * Re-check them when updating.
 */

// Shown with the prices. Update it whenever `priceRm` values change.
export const pricesAsOf = 'September 2026';

/** [low, high] in RM → "RM 60–90". Null when there's no price yet. */
export function formatPrice(range) {
  if (!range) return null;
  const [low, high] = range;
  return low === high ? `RM ${low}` : `RM ${low}–${high}`;
}

export const chips = {
  nrf52: {
    name: 'nRF52 radios',
    short: 'nRF52',
    headline: 'Low power, no Wi-Fi',
    summary: 'draw about 7 mA with the screen off in the measurements below. No Wi-Fi.',
    points: [
      'Draws about 7 mA with the screen off in the measurements below.',
      'No Wi-Fi. Your phone can still connect it to MQTT over Bluetooth.',
    ],
  },
  esp32: {
    name: 'ESP32 radios',
    short: 'ESP32',
    headline: 'Wi-Fi, higher power',
    summary: 'have Wi-Fi, but draw over 100 mA in the measurements below, more than ten times an nRF52 board.',
    points: [
      'Has Wi-Fi, so it can reach MQTT without your phone.',
      'Draws over 100 mA in the measurements below.',
      'Turning Wi-Fi on turns Bluetooth off, so you can’t use both at once.',
    ],
  },
};

// Current draw measured by Meshtastic users from a 3.7 V battery, on
// firmware 2.3.10. Bluetooth on, in mA.
export const powerTest = {
  source: 'https://github.com/HarukiToreda/Meshtastic-Experiments/blob/main/LoRa-Boards-Power-Measurements.md',
  rows: [
    {radio: 'RAK WisBlock (RAK19007)', chip: 'nrf52', screenOn: null, screenOff: 7},
    {radio: 'Heltec T114', chip: 'nrf52', screenOn: 19, screenOff: 7},
    {radio: 'Wio Tracker L1 Pro', chip: 'nrf52', screenOn: 16, screenOff: 7},
    {radio: 'Heltec V3', chip: 'esp32', screenOn: 109, screenOff: 101},
    {radio: 'Heltec V4', chip: 'esp32', screenOn: 111, screenOff: 105},
    {radio: 'LilyGO T-Deck', chip: 'esp32', screenOn: 140, screenOff: 113},
  ],
};

/*
 * The picked radios. `form` is 'ready' (case and battery in the box) or
 * 'diy' (a bare board: add a LiPo, and a case). `lowBand` is true when a
 * 433 MHz version exists, a note when there's a catch, or null.
 * `priceRm` is [low, high], or null until someone checks local prices.
 */
export const devices = [
  {
    id: 't1000e',
    name: 'SenseCAP T1000-E',
    maker: 'Seeed',
    chip: 'nrf52',
    form: 'ready',
    why: 'Card-sized and waterproof, with GPS. It has no screen and no antenna plug.',
    screen: 'None',
    gps: 'Yes',
    inBox: 'Ready to use: 700 mAh battery, sealed IP65 case',
    connector: 'Built in',
    lowBand: null,
    priceRm: null,
    url: 'https://www.seeedstudio.com/SenseCAP-Card-Tracker-T1000-E-for-Meshtastic-p-5913.html',
  },
  {
    id: 'wio-l1-pro',
    name: 'Wio Tracker L1 Pro',
    maker: 'Seeed',
    chip: 'nrf52',
    form: 'ready',
    why: 'A screen, GPS and a 2000 mAh battery in a case. The plain L1 has no case, so get the Pro.',
    screen: 'OLED',
    gps: 'Yes',
    inBox: 'Ready to use: 2000 mAh battery, case',
    connector: 'IPEX',
    lowBand: null,
    priceRm: null,
    url: 'https://www.seeedstudio.com/Wio-Tracker-L1-Pro-p-6454.html',
  },
  {
    id: 'techo',
    name: 'LilyGO T-Echo',
    maker: 'LilyGO',
    chip: 'nrf52',
    form: 'ready',
    why: 'An e-ink screen, GPS and an 850 mAh battery in a case.',
    screen: 'E-ink',
    gps: 'Yes',
    inBox: 'Ready to use: 850 mAh battery, case',
    connector: 'IPEX',
    lowBand: true,
    priceRm: null,
    url: 'https://lilygo.cc/en-us/products/t-echo-meshtastic',
  },
  {
    id: 'wismesh-pocket',
    name: 'WisMesh Pocket V2',
    maker: 'RAK',
    chip: 'nrf52',
    form: 'ready',
    why: 'A 3200 mAh battery, a screen and GPS, with an SMA plug for a better antenna.',
    screen: 'OLED',
    gps: 'Yes',
    inBox: 'Ready to use: 3200 mAh battery, case',
    connector: 'SMA',
    lowBand: null,
    priceRm: null,
    url: 'https://store.rakwireless.com/products/wismesh-pocket',
  },
  {
    id: 'heltec-t114',
    name: 'Heltec T114',
    maker: 'Heltec',
    chip: 'nrf52',
    form: 'diy',
    why: 'An nRF52 board. The screen, GPS and case are options when you order.',
    screen: 'Colour (optional)',
    gps: 'Optional',
    inBox: 'Bare board: add a LiPo. Case optional',
    connector: 'IPEX',
    lowBand: true,
    priceRm: null,
    url: 'https://heltec.org/project/mesh-node-t114/',
  },
  {
    id: 'xiao-kit',
    name: 'XIAO nRF52840 + Wio-SX1262 kit',
    maker: 'Seeed',
    chip: 'nrf52',
    form: 'diy',
    why: 'A small nRF52 board and a LoRa board. The kit has no screen, so you do everything in the app.',
    screen: 'None',
    gps: 'Optional',
    inBox: 'Two small boards: add a LiPo and a case',
    connector: 'IPEX',
    lowBand: 'with the separate Wio-SX1262-LF module',
    priceRm: null,
    url: 'https://www.seeedstudio.com/XIAO-nRF52840-Wio-SX1262-Kit-for-Meshtastic-p-6400.html',
  },
  {
    id: 'rak-kit',
    name: 'WisBlock Meshtastic Starter Kit',
    maker: 'RAK',
    chip: 'nrf52',
    form: 'diy',
    why: 'An nRF52 base board. The screen, GPS and sensors are plug-in modules.',
    screen: 'OLED (optional)',
    gps: 'Optional',
    inBox: 'Base board and core: add a LiPo and a case',
    connector: 'IPEX',
    lowBand: 'the EU433 version (not CN470)',
    priceRm: null,
    url: 'https://store.rakwireless.com/products/wisblock-meshtastic-starter-kit',
  },
  {
    id: 'heltec-v3',
    name: 'Heltec V3',
    maker: 'Heltec',
    chip: 'esp32',
    form: 'diy',
    why: 'An ESP32 board with a screen and Wi-Fi.',
    screen: 'OLED',
    gps: 'No',
    inBox: 'Bare board: add a LiPo. Case optional',
    connector: 'IPEX',
    lowBand: true,
    priceRm: null,
    url: 'https://heltec.org/project/wifi-lora-32-v3/',
  },
  {
    id: 'heltec-v4',
    name: 'Heltec V4',
    maker: 'Heltec',
    chip: 'esp32',
    form: 'diy',
    why: 'The V3’s successor, with a GPS socket and solar input. At home on USB power, it can use Wi-Fi for MQTT.',
    screen: 'OLED',
    gps: 'Optional',
    inBox: 'Bare board: add a LiPo. Case optional',
    connector: 'IPEX',
    lowBand: null,
    priceRm: null,
    url: 'https://heltec.org/project/wifi-lora-32-v4/',
  },
  {
    id: 'heltec-tracker',
    name: 'Heltec Wireless Tracker V2',
    maker: 'Heltec',
    chip: 'esp32',
    form: 'diy',
    why: 'GPS and a colour screen on one small board, with Wi-Fi.',
    screen: 'Colour',
    gps: 'Yes',
    inBox: 'Bare board: add a LiPo and a case',
    connector: 'IPEX',
    lowBand: null,
    priceRm: null,
    url: 'https://heltec.org/project/wireless-tracker-v2/',
  },
  {
    id: 'tdeck-plus',
    name: 'LilyGO T-Deck Plus',
    maker: 'LilyGO',
    chip: 'esp32',
    form: 'ready',
    why: 'A keyboard, a screen and GPS, so you can send messages without a phone.',
    screen: 'Colour + keyboard',
    gps: 'Yes',
    inBox: 'Ready to use: 2000 mAh battery, case',
    connector: 'IPEX',
    lowBand: true,
    priceRm: null,
    url: 'https://lilygo.cc/en-us/products/t-deck-plus-meshtastic',
  },
  {
    id: 'tlora-pager',
    name: 'LilyGO T-Lora Pager',
    maker: 'LilyGO',
    chip: 'esp32',
    form: 'ready',
    why: 'A pocket-sized keyboard handheld with GPS and a 1500 mAh battery.',
    screen: 'Colour + keyboard',
    gps: 'Yes',
    inBox: 'Ready to use: 1500 mAh battery, case',
    connector: 'Not stated',
    lowBand: true,
    priceRm: null,
    url: 'https://lilygo.cc/en-us/products/t-lora-pager-meshtastic',
  },
];

// Band versions a buyer meets, with examples from makers' product pages.
// The SX1262 itself covers 150–960 MHz (Semtech datasheet).
export const bands = [
  {band: 'High band', examples: '902–928 MHz (Heltec V3, 915 MHz option); 862–930 MHz (Seeed Wio-SX1262)', use: 'MY_919 (919–924 MHz). Buy the 915 MHz version.'},
  {band: 'Low band', examples: '433 MHz (Heltec, LilyGO); 470–510 MHz (Heltec, China band)', use: 'Licensed amateur operators only (see below).'},
  {band: '2.4 GHz', examples: '2400–2483.5 MHz (Meshtastic LORA_24 region)', use: 'Not used by MeshMY.'},
];

export const beforeYouBuy = [
  {
    title: 'Buy the 915 MHz version.',
    text: 'Radios are sold in versions for different bands. MY_919 (919–924 MHz) is inside the 902–928 MHz range of the 915 MHz versions. See Frequency bands below.',
  },
  {
    title: 'Fit the antenna before you switch it on.',
    text: 'Transmitting without one can damage the radio.',
  },
  {
    title: 'Have a USB data cable.',
    text: 'Some cables only charge. Setup over USB needs one that carries data.',
  },
];

/*
 * "Find your radio". The first option of each is the default, which is also
 * what renders at build time (and without JS). `why` explains the question.
 */
export const pickerQuestions = [
  {
    id: 'where',
    label: 'Where will it spend most of its time?',
    why: 'A radio you carry runs on its battery, so battery life matters. One at home can stay plugged in.',
    options: [
      {value: 'carry', label: 'With me'},
      {value: 'home', label: 'At home'},
    ],
  },
  {
    id: 'phone',
    label: 'Will you use it with your phone?',
    why: 'Most of these picks have no keyboard. You type in the Meshtastic app, and your phone talks to the radio over Bluetooth. A few radios have their own keyboard.',
    options: [
      {value: 'phone', label: 'With my phone'},
      {value: 'standalone', label: 'On its own'},
    ],
  },
  {
    id: 'diy',
    label: 'Happy to add a battery and a case yourself?',
    why: 'Bare boards cost less, but you buy a battery, check its plug fits, and buy or print a case. Ready-made radios work out of the box.',
    options: [
      {value: 'no', label: 'No, ready to use'},
      {value: 'yes', label: 'Yes, I’ll put it together'},
    ],
  },
  {
    id: 'wifi',
    label: 'Do you want Wi-Fi on the radio?',
    why: 'Wi-Fi lets the radio reach MQTT, the internet link between meshes, without your phone. Of these picks, only the ESP32 radios have it, and they draw more power.',
    options: [
      {value: 'no', label: 'No'},
      {value: 'yes', label: 'Yes'},
    ],
  },
];

/** Picker rules: answers → {ids, note}. Every combination gives picks. */
export function pickRadios({where, phone, diy, wifi}) {
  const ready = diy !== 'yes';
  if (phone === 'standalone') {
    return {
      ids: ['tdeck-plus', 'tlora-pager'],
      note: ready
        ? 'Both have a keyboard, a screen and Wi-Fi, and work without a phone. They’re ESP32, so they draw more power.'
        : 'Of these picks, the keyboard radios only come ready-made. Both have a screen and Wi-Fi, and they’re ESP32, so they draw more power.',
    };
  }
  if (where === 'home') {
    if (wifi === 'yes') {
      return ready
        ? {
            ids: ['heltec-v4', 'tdeck-plus'],
            note: 'Of these picks, the only ready-made radios with Wi-Fi have keyboards. The Heltec V4 is a bare board, but at home it runs on USB power, so all it needs is a case (Heltec sells one).',
          }
        : {
            ids: ['heltec-v4', 'heltec-v3'],
            note: 'At home it can stay on USB power, so the ESP32’s power use doesn’t matter, and you get Wi-Fi.',
          };
    }
    return ready
      ? {
          ids: ['wismesh-pocket', 'wio-l1-pro'],
          note: 'At home it can stay on USB power. The Pocket V2 has an SMA plug, so you can fit a different antenna.',
        }
      : {
          ids: ['rak-kit', 'heltec-t114'],
          note: 'At home it can stay on USB power, and you can still take it with you.',
        };
  }
  if (wifi === 'yes') {
    return ready
      ? {
          ids: ['tdeck-plus', 'tlora-pager'],
          note: 'The ready-made radios here with Wi-Fi both have keyboards. For a small pocket radio, answer “No” to Wi-Fi. Your phone can connect an nRF52 radio to MQTT instead.',
        }
      : {
          ids: ['heltec-v3', 'heltec-tracker'],
          note: 'Wi-Fi means ESP32, which draws over ten times the current of an nRF52 board. Your phone can connect an nRF52 radio to MQTT instead.',
        };
  }
  return ready
    ? {ids: ['t1000e', 'wio-l1-pro', 'techo'], note: 'All three are nRF52, with GPS, a battery and a case.'}
    : {ids: ['heltec-t114', 'xiao-kit', 'rak-kit'], note: 'All three are nRF52. Check the battery plug’s polarity before you connect it (see the checklist below).'};
}

export const formFactors = [
  {
    title: 'Bare board',
    text: 'A circuit board with a radio and an antenna plug. It costs less, but you add a battery and a case.',
    examples: 'Heltec V3 and V4, Heltec T114, XIAO kit, RAK WisBlock',
  },
  {
    title: 'Pocket radio',
    text: 'In a case with a battery, paired to your phone.',
    examples: 'WisMesh Pocket V2, Wio Tracker L1 Pro, T-Echo',
  },
  {
    title: 'Card or tag',
    text: 'Sealed and card-sized. The T1000-E has no screen.',
    examples: 'SenseCAP T1000-E',
  },
  {
    title: 'Keyboard handheld',
    text: 'A screen and keyboard, so it works without a phone. Both picks are ESP32, so they draw more power.',
    examples: 'T-Deck Plus, T-Lora Pager',
  },
];

export const features = [
  {
    title: 'Screen',
    text: 'Shows the pairing PIN. Radios without a screen use the PIN 123456, and you do everything in the app.',
  },
  {
    title: 'GPS',
    text: 'Gives the radio its position and the time. You can skip it, because the app can use your phone’s GPS instead.',
  },
  {
    title: 'Battery',
    text: 'Ready-made radios include one. Bare boards take a single-cell 3.7 V LiPo with a small JST plug. Check the plug’s polarity before you connect it.',
  },
  {
    title: 'Antenna plug',
    text: 'SMA is a screw-on plug. IPEX (U.FL) is a small snap-on plug rated for about 30 connections, so if you plan to change antennas, use a short IPEX-to-SMA cable.',
  },
  {
    title: 'Sensors',
    text: 'Meshtastic can report temperature, humidity and air pressure from sensors such as the BME280. The RAK WisBlock takes the RAK1906 environment sensor as a plug-in module.',
  },
];

export const starts = [
  {
    kicker: 'Ready-made',
    title: 'In a case, with a battery',
    text: 'Charge it and pair it with your phone.',
    ids: ['wio-l1-pro', 't1000e'],
  },
  {
    kicker: 'Build it yourself',
    title: 'Add a battery and a case',
    text: 'Lower maker prices than the ready-made picks. You add a LiPo battery and a case.',
    ids: ['heltec-t114', 'xiao-kit'],
  },
];

export const upgrades = [
  {
    kicker: 'Better range',
    title: 'A better antenna',
    text: 'Meshtastic’s antenna guide says stock antennas may not be tuned for your frequency. Use an antenna made for 915 MHz, with the same plug as the radio (SMA, RP-SMA or IPEX). The T1000-E’s antenna is built in and can’t be changed.',
  },
  {
    kicker: 'Longer battery',
    title: 'Move to nRF52',
    text: 'An nRF52 radio draws about 7 mA with the screen off, against over 100 mA for an ESP32 radio.',
    ids: ['rak-kit', 'wismesh-pocket'],
  },
  {
    kicker: 'No phone needed',
    title: 'A keyboard handheld',
    text: 'Type and read messages on the radio itself.',
    ids: ['tdeck-plus', 'tlora-pager'],
  },
  {
    kicker: 'Location',
    title: 'Add GPS',
    text: 'Share your position without your phone. All the ready-made picks already have it.',
    ids: ['heltec-tracker', 't1000e'],
  },
  {
    kicker: 'A node at home',
    title: 'A radio on USB power',
    text: 'A radio that stays at home can run on USB power, so its power use doesn’t matter. An ESP32 board can then use Wi-Fi for MQTT.',
    ids: ['heltec-v4', 'wismesh-pocket'],
  },
];

export const listingChecklist = [
  {
    title: 'The band.',
    text: 'Pick the 915 MHz or 902–928 MHz option. Some makers sell every band on one product page, for example the Heltec V3.',
  },
  {
    title: 'What’s in the box.',
    text: 'On some boards the screen, GPS and case are options, for example the Heltec T114. Check which one you’re paying for.',
  },
  {
    title: 'The antenna plug.',
    text: 'SMA and RP-SMA plugs aren’t compatible. Buy antennas and cables to match the radio.',
  },
  {
    title: 'The battery plug.',
    text: 'JST battery plugs aren’t wired the same way by every maker. Connected the wrong way round, a battery can damage the board.',
  },
  {
    title: 'The maker.',
    text: 'Compare the listing with the maker’s own product page (the Specs links above).',
  },
  {
    title: 'The power limit.',
    text: 'MY_919 allows up to 500 mW (27 dBm), counting the antenna’s gain. With a high-gain antenna, turn the radio’s transmit power down to stay within it.',
  },
];
