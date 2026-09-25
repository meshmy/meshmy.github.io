// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Local secrets live in the git-ignored .env.local. Variables already set in
// the environment (e.g. CI secrets) take precedence.
try {
  process.loadEnvFile('.env.local');
} catch (err) {
  // No .env.local is fine: everything has a fallback. Anything else (an
  // unreadable file, or Node < 20.12 without loadEnvFile) should fail loudly.
  if (err?.code !== 'ENOENT') throw err;
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MeshMY',
  tagline: 'Building the Meshtastic mesh network community',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://meshmy.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Environment variables are listed in README.md.
  customFields: {
    // CARTO basemap key for the homepage map, read at build time. Tiles are
    // fetched by the browser, so the key ends up public in the built site;
    // it comes from the environment only to keep it out of the repo.
    cartoApiKey: process.env.CARTO_API_KEY || '',
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'meshmy', // Usually your GitHub org/user name.
  projectName: 'meshmy.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'MeshMY',
        items: [
          {to: '/', label: 'Home', position: 'left'},
          {to: '/about', label: 'About', position: 'left'},
          {
            type: 'dropdown',
            to: '/meshtastic',
            label: 'Meshtastic',
            position: 'left',
            items: [
              {to: '/meshtastic/join', label: 'Connect to mesh'},
              {to: '/meshtastic/mqtt', label: 'Set up MQTT'},
              {to: '/meshtastic/weekly-net', label: 'Weekly Check-in'},
              {to: '/meshtastic/infrastructure', label: 'Infrastructure'},
              // Not a link: a separator with a group label.
              {type: 'html', value: 'Tools', className: 'mm-dropdown-heading'},
              {to: '/meshtastic/foliage-calculator', label: 'Foliage Calculator'},
            ],
          },
          {to: '/events', label: 'Events', position: 'left'},
          {
            href: 'https://github.com/meshmy',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Site',
            items: [
              {label: 'Home', to: '/'},
              {label: 'About', to: '/about'},
              {label: 'Events', to: '/events'},
            ],
          },
          {
            title: 'Meshtastic',
            items: [
              {label: 'Overview', to: '/meshtastic'},
              {label: 'Connect to mesh', to: '/meshtastic/join'},
              {label: 'Set up MQTT', to: '/meshtastic/mqtt'},
              {label: 'Weekly Check-in', to: '/meshtastic/weekly-net'},
              {label: 'Infrastructure', to: '/meshtastic/infrastructure'},
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/meshmy',
              },
              {
                label: 'Meshtastic Project',
                href: 'https://meshtastic.org',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MeshMY. Built with Docusaurus.<br/>
<small>Meshtastic® is a registered trademark of Meshtastic LLC. Meshtastic logo trademark is the trademark of Meshtastic LLC. This site is not affiliated with or endorsed by the Meshtastic project.</small>`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
