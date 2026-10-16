/**
 * Content for the Buying guide (src/pages/meshtastic/buying-guide.js): the
 * listed radios, the picker questions and rules, and the words
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
    headline: 'About 7 mA, no Wi-Fi',
    summary: 'draw about 7 mA with the screen off in the measurements below. They have no Wi-Fi.',
    points: [
      'Draws about 7 mA with the screen off in the measurements below.',
      'No Wi-Fi. Your phone can still connect it to MQTT over Bluetooth.',
    ],
  },
  esp32: {
    name: 'ESP32 radios',
    short: 'ESP32',
    headline: 'Wi-Fi, over 100 mA',
    summary: 'have Wi-Fi, and draw over 100 mA in the measurements below.',
    points: [
      'Has Wi-Fi, so it can reach MQTT without your phone.',
      'Draws over 100 mA in the measurements below.',
      'Turning Wi-Fi on turns Bluetooth off.',
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
 * The listed radios. `form` is 'ready' (case and battery in the box) or
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
    why: 'Card-sized, with GPS and an IP65 case. It has no screen and no antenna plug.',
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
    why: 'A screen and GPS. The Pro version comes with a 2000 mAh battery and a case. The plain L1 has neither.',
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
    why: 'A 3200 mAh battery, a screen and GPS, with an SMA plug so you can fit a different antenna.',
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
    why: 'A handheld with a keyboard, a screen, GPS and a battery.',
    screen: 'Colour + keyboard',
    gps: 'Yes',
    inBox: 'Ready to use: battery, case',
    connector: 'Not stated',
    lowBand: true,
    priceRm: null,
    url: 'https://lilygo.cc/en-us/products/t-lora-pager-meshtastic',
  },
];

// Band versions a buyer meets, with examples from makers' product pages.
// The SX1262 itself covers 150–960 MHz (Semtech datasheet).
export const bands = [
  {band: 'High band', examples: '902–928 MHz (Heltec V3, 915 MHz option), 862–930 MHz (Seeed Wio-SX1262)', use: 'MY_919 (919–924 MHz). Any high-band version works. The 915 MHz version’s antenna is tuned closest to MY_919.'},
  {band: 'Low band', examples: '433 MHz (Heltec, LilyGO), 470–510 MHz (Heltec, China band)', use: 'Licensed amateur operators only (see below).'},
  {band: '2.4 GHz', examples: '2400–2483.5 MHz (Meshtastic LORA_24 region)', use: 'Not used in Malaysia.'},
];

export const beforeYouBuy = [
  {
    title: 'Buy a high-band version, ideally 915 MHz.',
    text: 'Radios are sold in versions for different bands. Any high-band version (868, 915 or 923 MHz) works on MY_919. The antenna that comes with the 915 MHz version is tuned closest to MY_919’s frequencies. Antennas for the other versions, especially 868 MHz, may give less range. See Frequency bands below.',
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
 * "Narrow down the list". The first option of each is the default, which is also
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
    why: 'Most of the radios on this page have no keyboard. You type in the Meshtastic app, and your phone connects to the radio over Bluetooth. A few radios have their own keyboard.',
    options: [
      {value: 'phone', label: 'With my phone'},
      {value: 'standalone', label: 'On its own'},
    ],
  },
  {
    id: 'diy',
    label: 'Will you add a battery and a case yourself?',
    why: 'A bare board needs a battery with the right plug, and a case you buy or 3D-print. A ready-made radio comes with both.',
    options: [
      {value: 'no', label: 'No, ready-made'},
      {value: 'yes', label: 'Yes'},
    ],
  },
  {
    id: 'wifi',
    label: 'Do you want Wi-Fi on the radio?',
    why: 'Wi-Fi lets the radio reach MQTT, the internet link between meshes, without your phone. Of the radios on this page, only the ESP32 ones have it, and they draw more current.',
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
        ? 'Both have a keyboard, a screen and Wi-Fi, and work without a phone. Both are ESP32 radios, which draw more current.'
        : 'The keyboard radios on this page only come ready-made. Both have a screen and Wi-Fi, and both are ESP32 radios, which draw more current.',
    };
  }
  if (where === 'home') {
    if (wifi === 'yes') {
      return ready
        ? {
            ids: ['heltec-v4', 'tdeck-plus'],
            note: 'The ready-made radios on this page with Wi-Fi both have keyboards. The Heltec V4 is a bare board. At home it runs on USB power, so it needs no battery, and Heltec sells a case for it.',
          }
        : {
            ids: ['heltec-v4', 'heltec-v3'],
            note: 'At home it can stay on USB power, so battery life isn’t a concern, and an ESP32 board has Wi-Fi.',
          };
    }
    return ready
      ? {
          ids: ['wismesh-pocket', 'wio-l1-pro'],
          note: 'At home it can stay on USB power. The Pocket V2 has an SMA plug, so you can fit a different antenna.',
        }
      : {
          ids: ['rak-kit', 'heltec-t114'],
          note: 'At home it can stay on USB power. You can still take it with you.',
        };
  }
  if (wifi === 'yes') {
    return ready
      ? {
          ids: ['tdeck-plus', 'tlora-pager'],
          note: 'The ready-made radios on this page with Wi-Fi both have keyboards. For a small pocket radio, answer “No” to Wi-Fi. Your phone can connect an nRF52 radio to MQTT instead.',
        }
      : {
          ids: ['heltec-v3', 'heltec-tracker'],
          note: 'Both are ESP32 boards, which draw more current than nRF52 boards (see the measurements below). Your phone can connect an nRF52 radio to MQTT instead.',
        };
  }
  return ready
    ? {ids: ['t1000e', 'wio-l1-pro', 'techo'], note: 'All three are nRF52 radios with GPS, a battery and a case.'}
    : {ids: ['heltec-t114', 'xiao-kit', 'rak-kit'], note: 'All three are nRF52 boards. Check the battery plug’s polarity before you connect it (see the checklist below).'};
}

export const formFactors = [
  {
    title: 'Bare board',
    text: 'A circuit board with a radio and an antenna plug. You add a battery and a case.',
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
    text: 'A screen and keyboard, so it works without a phone. Both on this page are ESP32 radios, which draw more current.',
    examples: 'T-Deck Plus, T-Lora Pager',
  },
];

export const features = [
  {
    title: 'Screen',
    text: 'Shows the pairing PIN. A radio with no screen uses the fixed PIN 123456 by default, and you do everything in the app.',
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
    text: 'SMA is a screw-on plug. IPEX (U.FL) is a small snap-on plug rated for about 30 connections. If you plan to change antennas, fit a short IPEX-to-SMA cable once and change antennas at the SMA end.',
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
    kicker: 'Bare board',
    title: 'Add a battery and a case',
    text: 'Buy a single-cell LiPo with a matching plug, and buy or 3D-print a case.',
    ids: ['heltec-t114', 'xiao-kit'],
  },
];

export const upgrades = [
  {
    title: 'More range',
    text: 'Meshtastic’s antenna guide says stock antennas may not be tuned for your frequency. Use an antenna made for 915 MHz, with the same plug as the radio (SMA, RP-SMA or IPEX). The T1000-E’s antenna is built in and can’t be changed.',
  },
  {
    title: 'Longer battery life',
    text: 'An nRF52 radio draws about 7 mA with the screen off. An ESP32 radio draws over 100 mA.',
    ids: ['rak-kit', 'wismesh-pocket'],
  },
  {
    title: 'Messages without a phone',
    text: 'A radio with a keyboard lets you type and read messages on the radio itself.',
    ids: ['tdeck-plus', 'tlora-pager'],
  },
  {
    title: 'Position without a phone',
    text: 'A radio with GPS shares its position without your phone. All the ready-made radios on this page have GPS.',
    ids: ['heltec-tracker', 't1000e'],
  },
  {
    title: 'A radio that stays at home',
    text: 'It can run on USB power, so battery life isn’t a concern. An ESP32 board can then use Wi-Fi for MQTT.',
    ids: ['heltec-v4', 'wismesh-pocket'],
  },
];

export const listingChecklist = [
  {
    title: 'The band.',
    text: 'Pick a high-band option, ideally 915 MHz (902–928 MHz). Some makers sell every band on one product page, for example the Heltec V3.',
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
    text: 'Meshtastic limits MY_919 to 27 dBm (500 mW). The limit counts the antenna’s gain, so with a high-gain antenna, turn the radio’s transmit power down to stay within it.',
  },
];
