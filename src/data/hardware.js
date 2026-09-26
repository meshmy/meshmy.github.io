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
    headline: 'Long battery life, no Wi-Fi',
    summary: 'use little power, so a small battery lasts days. No Wi-Fi.',
    points: [
      'Uses little power. A small battery lasts days.',
      'No Wi-Fi. Your phone can still connect it to MQTT over Bluetooth.',
      'Most of Malaysia’s hilltop routers use it.',
    ],
  },
  esp32: {
    name: 'ESP32 radios',
    short: 'ESP32',
    headline: 'Wi-Fi, short battery life',
    summary: 'have Wi-Fi, but draw over ten times the current of an nRF52 board, so a small battery lasts hours. Fine on USB power.',
    points: [
      'Has Wi-Fi, so it can reach MQTT without your phone.',
      'Uses much more power. A pocket radio needs charging every day.',
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
    why: 'An e-ink screen you can read in sunlight, GPS, and a case.',
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
    why: 'An nRF52 board with good battery life. Order it with the screen and the case.',
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
    why: 'The cheapest option, and it uses very little power. It has no screen, so you do everything in the app.',
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
    why: 'The longest battery life in the bench test. Add a screen, GPS or sensors as clip-on modules.',
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
    why: 'The most common radio in Malaysia, and the cheapest with a screen and Wi-Fi. Charge it daily.',
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

// Band classes a buyer meets. Ranges are typical module ratings (e.g.
// Heltec 863–928, Seeed Wio-SX1262 862–930, Ebyte E22-900M 850–930 MHz;
// RAK4631-L 433–470 MHz). The SX1262 itself covers 150–960 MHz.
export const bands = [
  {band: 'High band', range: 'about 850–930 MHz', soldAs: '868, 915 or 923 MHz', use: 'MY_919. Buy 915 MHz if you can.'},
  {band: 'Low band', range: 'about 410–510 MHz', soldAs: '433 or 470 MHz', use: 'Licensed amateur operators only (see below). 470 MHz is for China.'},
  {band: '2.4 GHz', range: '2400–2483.5 MHz', soldAs: '2.4 GHz', use: 'Not used by MeshMY.'},
];

export const beforeYouBuy = [
  {
    title: 'Buy a high-band version, ideally 915 MHz.',
    text: 'Radios are sold in versions for different bands. Any high-band version (868, 915 or 923 MHz) works on MY_919, but the 915 MHz version’s antenna is tuned closest to it. See Frequency bands below.',
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
    why: 'A radio you carry runs on its battery, so battery life matters most. One at home can stay plugged in.',
    options: [
      {value: 'carry', label: 'With me'},
      {value: 'home', label: 'At home'},
    ],
  },
  {
    id: 'phone',
    label: 'Will you use it with your phone?',
    why: 'Most radios have no keyboard. You type in the Meshtastic app, and your phone talks to the radio over Bluetooth. A few radios have their own keyboard.',
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
    why: 'Wi-Fi lets the radio reach MQTT, the internet link between meshes, without your phone. Only ESP32 radios have it, and they use more power.',
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
        ? 'Both have a keyboard, a screen and Wi-Fi, and work without a phone. They’re ESP32, so charge them daily.'
        : 'Keyboard radios only come ready-made. Both have a screen and Wi-Fi, and they’re ESP32, so charge them daily.',
    };
  }
  if (where === 'home') {
    if (wifi === 'yes') {
      return ready
        ? {
            ids: ['heltec-v4', 'tdeck-plus'],
            note: 'The only ready-made radios with Wi-Fi have keyboards. The Heltec V4 is a bare board, but at home it runs on USB power, so all it needs is a case (Heltec sells one).',
          }
        : {
            ids: ['heltec-v4', 'heltec-v3'],
            note: 'At home it can stay on USB power, so the ESP32’s power use doesn’t matter, and you get Wi-Fi.',
          };
    }
    return ready
      ? {
          ids: ['wismesh-pocket', 'wio-l1-pro'],
          note: 'At home it can stay on USB power. The Pocket V2’s SMA plug makes it easy to fit a bigger antenna later.',
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
          note: 'Wi-Fi means ESP32, which drains a small battery in under a day. Your phone can connect an nRF52 radio to MQTT instead.',
        };
  }
  return ready
    ? {ids: ['t1000e', 'wio-l1-pro', 'techo'], note: 'All three are nRF52, with GPS, a battery and a case.'}
    : {ids: ['heltec-t114', 'xiao-kit', 'rak-kit'], note: 'All three are nRF52. Check the battery plug’s polarity before you connect it (see the checklist below).'};
}

export const formFactors = [
  {
    title: 'Bare board',
    text: 'A circuit board with a radio and an antenna plug. Cheapest, but you add a battery and a case.',
    examples: 'Heltec V3 and V4, Heltec T114, XIAO kit, RAK WisBlock',
  },
  {
    title: 'Pocket radio',
    text: 'In a case with a battery, paired to your phone. The easiest way to start.',
    examples: 'WisMesh Pocket V2, Wio Tracker L1 Pro, T-Echo',
  },
  {
    title: 'Card or tag',
    text: 'Small, sealed and light, for a keyring or a bag. Usually no screen.',
    examples: 'SenseCAP T1000-E',
  },
  {
    title: 'Keyboard handheld',
    text: 'A screen and keyboard, so it works without a phone. Bigger, and ESP32, so it needs daily charging.',
    examples: 'T-Deck Plus, T-Lora Pager',
  },
];

export const features = [
  {
    title: 'Screen',
    text: 'Shows the pairing PIN, messages and who’s nearby. OLED is sharp but small. E-ink reads well in sunlight and uses almost no power. You can do without one and use the app for everything.',
  },
  {
    title: 'GPS',
    text: 'Shares your position on the map and sets the clock. You can skip it, because the app can share your phone’s location instead.',
  },
  {
    title: 'Battery',
    text: 'Ready-made radios include one. Bare boards take a single-cell 3.7 V LiPo with a small JST plug. Check the plug’s polarity before you connect it.',
  },
  {
    title: 'Buttons',
    text: 'A button wakes the screen or sends a quick message. Most radios have one or two.',
  },
  {
    title: 'Antenna plug',
    text: 'SMA is sturdy and easy to swap. IPEX (U.FL) is a tiny snap-on plug that wears out if you swap it often. If you plan to upgrade, use a short IPEX-to-SMA cable.',
  },
  {
    title: 'Sensors',
    text: 'Some radios can report temperature, humidity and air pressure to the mesh as telemetry. The RAK WisBlock takes clip-on sensor modules; others need a sensor wired to them.',
  },
];

export const starts = [
  {
    kicker: 'Ready-made',
    title: 'In a case, with a battery',
    text: 'The easiest way to start.',
    ids: ['wio-l1-pro', 't1000e'],
  },
  {
    kicker: 'Build it yourself',
    title: 'Add a battery and a case',
    text: 'Cheaper than ready-made. No soldering needed.',
    ids: ['heltec-t114', 'xiao-kit'],
  },
];

export const upgrades = [
  {
    kicker: 'Better range',
    title: 'A better antenna, then height',
    text: 'A good 915 MHz antenna is the cheapest upgrade, because stock antennas are often poorly tuned. Then move the radio higher, to a window or a higher floor. Match the plug (SMA, RP-SMA or IPEX). The T1000-E’s antenna is built in and can’t be changed.',
  },
  {
    kicker: 'Longer battery',
    title: 'Move to nRF52',
    text: 'An nRF52 radio lasts days on a battery that runs an ESP32 radio for hours. A bigger battery also helps.',
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
    text: 'Share your position without your phone. Most ready-made radios already have it.',
    ids: ['heltec-tracker', 't1000e'],
  },
  {
    kicker: 'A node at home',
    title: 'A radio by the window',
    text: 'A radio on USB power by a high window, with a better antenna, keeps you on the mesh when you’re out. Set its role to CLIENT_BASE.',
    ids: ['heltec-v4', 'wismesh-pocket'],
  },
];

export const listingChecklist = [
  {
    title: 'The band.',
    text: 'The listing, or the option you pick, is a high-band version, ideally 915 MHz. Many listings make you choose at checkout.',
  },
  {
    title: 'What’s in the box.',
    text: 'Battery, case, antenna and screen are often extras. Check the photos match the option you pick.',
  },
  {
    title: 'The antenna plug.',
    text: 'SMA and RP-SMA look alike but don’t fit each other. Buy antennas and cables to match the radio.',
  },
  {
    title: 'The battery plug.',
    text: 'JST battery plugs aren’t wired the same way by every maker. Connected the wrong way round, a battery can damage the board.',
  },
  {
    title: 'The maker.',
    text: 'Copies of popular boards exist. Compare the listing with the maker’s own product page (the Specs links above).',
  },
  {
    title: 'The power limit.',
    text: 'MY_919 allows up to 500 mW (27 dBm), counting the antenna’s gain. With a high-gain antenna, turn the radio’s transmit power down to stay within it.',
  },
];
