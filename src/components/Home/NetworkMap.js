import {useEffect, useRef} from 'react';
import {useColorMode} from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {sites, links, siteStatus, siteElevation, SITE_STATUS, STATUS, maintainerOf, meshmapUrl} from '@site/src/data/sites';
import 'leaflet/dist/leaflet.css';
import styles from './NetworkMap.module.css';

// CARTO basemaps need an API key (CARTO_API_KEY at build time). Without
// one, tiles still load but carry an "API key required" watermark.
const tileUrl = (theme, key) =>
  `https://basemaps.cartocdn.com/rastertiles/${theme === 'light' ? 'light_all' : 'dark_all'}/{z}/{x}/{y}{r}.png` +
  (key ? `?key=${encodeURIComponent(key)}` : '');
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const LABEL_ZOOM = 10;

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);

function popupHtml(site) {
  const status = siteStatus(site);
  const bands = site.bands
    .map((b) => {
      const s = b.status || 'active';
      const label = STATUS[s]?.label ?? s;
      return `<li><span class="mm-dot mm-dot--${escape(s)}"></span><strong>${escape(b.freq)}</strong> · ${label}</li>`;
    })
    .join('');
  return `<div class="mm-pop">
    <div class="mm-pop__head"><strong>${escape(site.name)}</strong><code>${escape(site.shortName)}</code></div>
    <div class="mm-pop__meta">${escape(site.area)} · ${escape(siteElevation(site))}</div>
    <div class="mm-pop__meta">Maintained by ${escape(maintainerOf(site).name)}${site.approx ? ' · approximate position' : ''}</div>
    <ul class="mm-pop__bands">${bands}</ul>
    <div class="mm-pop__foot">${SITE_STATUS[status].label} ·
      <a href="${escape(meshmapUrl(site.meshmapId))}" target="_blank" rel="noreferrer">Live telemetry ↗</a></div>
  </div>`;
}

/**
 * Leaflet map of community router sites and the RF links between them.
 * Leaflet touches `window`, so it's imported lazily on the client; the
 * server render is a sized placeholder listing the sites.
 */
export default function NetworkMap({focus, onSelect}) {
  const el = useRef(null);
  const map = useRef(null);
  const tiles = useRef(null);
  const markers = useRef({});
  const {colorMode} = useColorMode();
  const {cartoApiKey} = useDocusaurusContext().siteConfig.customFields;
  const pending = useRef(focus);
  pending.current = focus;

  const flyTo = (name) => {
    const mk = markers.current[name];
    if (!mk || !map.current) return;
    map.current.flyTo(mk.getLatLng(), Math.max(map.current.getZoom(), 11), {duration: 0.6});
    mk.openPopup();
  };

  useEffect(() => {
    let cancelled = false;
    import('leaflet').then(({default: L}) => {
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, {
        zoomControl: false,
        scrollWheelZoom: false, // don't hijack page scroll
        attributionControl: true,
      });
      L.control.zoom({position: 'bottomright'}).addTo(m);
      m.attributionControl.setPrefix(false);
      map.current = m;

      const byName = Object.fromEntries(sites.map((s) => [s.shortName, s]));
      links.forEach(([a, b]) => {
        if (!byName[a] || !byName[b]) return;
        L.polyline(
          [
            [byName[a].lat, byName[a].lon],
            [byName[b].lat, byName[b].lon],
          ],
          {className: 'mm-link', interactive: false},
        ).addTo(m);
      });

      sites.forEach((site) => {
        const status = siteStatus(site);
        const icon = L.divIcon({
          className: '',
          html: `<span class="mm-marker mm-marker--${status}"><span class="mm-marker__pin"></span><span class="mm-marker__label">${escape(site.shortName)}</span></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -8],
        });
        const mk = L.marker([site.lat, site.lon], {
          icon,
          title: `${site.name} (${SITE_STATUS[status].label})`,
          keyboard: true,
          riseOnHover: true,
        })
          .bindPopup(popupHtml(site), {className: 'mm-popup', maxWidth: 260})
          .on('click', () => onSelect?.(site.shortName))
          .addTo(m);
        markers.current[site.shortName] = mk;
      });

      // Zoomed out far enough to show every region, nearby sites' labels
      // overlap: show them only from LABEL_ZOOM in.
      const syncLabels = () => el.current?.classList.toggle(styles.far, m.getZoom() < LABEL_ZOOM);
      m.on('zoomend', syncLabels);
      m.fitBounds(
        L.latLngBounds(sites.map((s) => [s.lat, s.lon])),
        {padding: [36, 36]},
      );
      syncLabels();
      tiles.current = L.tileLayer(tileUrl(document.documentElement.dataset.theme, cartoApiKey), {
        attribution: ATTRIBUTION,
        maxZoom: 18,
      }).addTo(m);
      // A site picked before Leaflet finished loading.
      if (pending.current) flyTo(pending.current.name);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      markers.current = {};
    };
  }, []);

  // Swap basemap when the theme toggles.
  useEffect(() => {
    tiles.current?.setUrl(tileUrl(colorMode, cartoApiKey));
  }, [colorMode, cartoApiKey]);

  // Fly to a site picked from the list below the map. `focus` is
  // {name, n}; a new object on every pick, so re-picking works.
  useEffect(() => {
    if (focus) flyTo(focus.name);
  }, [focus]);

  return (
    <div className={styles.frame}>
      <div ref={el} className={styles.map} role="region" aria-label="Map of community router sites">
        <noscript>
          <ul className={styles.fallback}>
            {sites.map((s) => (
              <li key={s.shortName}>
                {s.name} ({s.shortName}) — {SITE_STATUS[siteStatus(s)].label}
              </li>
            ))}
          </ul>
        </noscript>
      </div>
      <div className={styles.legend} aria-hidden="true">
        {Object.keys(SITE_STATUS)
          .filter((k) => sites.some((s) => siteStatus(s) === k))
          .map((k) => (
            <span key={k}>
              <i className={`mm-marker mm-marker--${k}`}>
                <i className="mm-marker__pin" />
              </i>
              {SITE_STATUS[k].label}
            </span>
          ))}
        <span>
          <i className={styles.linkKey} />
          RF link
        </span>
      </div>
    </div>
  );
}
