import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  sites,
  STATUS,
  MAINTAINERS,
  UNKNOWN,
  maintainerOf,
  siteElevation,
  googleMapsUrl,
  meshmapUrl,
} from '@site/src/data/sites';

const groups = Object.entries(MAINTAINERS)
  .map(([key, m]) => ({key, ...m, sites: sites.filter((s) => maintainerOf(s) === m)}))
  .filter((g) => g.sites.length > 0);

export default function Infrastructure() {
  return (
    <Layout
      title="Infrastructure"
      description="Community-maintained Meshtastic router infrastructure in Malaysia, run by the MeshMY team and the Penang Meshtastic community.">
      <main className="container margin-vert--lg">
        <Heading as="h1">Infrastructure</Heading>
        <p>
          Beyond individual community nodes, volunteers build and maintain
          high-site routers to extend mesh coverage: the MeshMY team around
          the Klang Valley, and the Penang Meshtastic community on Penang
          Island.
        </p>

        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`maintainer-${group.key}`}>
        <Heading as="h2" id={`maintainer-${group.key}`} className="margin-top--lg">
          {group.name}
        </Heading>
        {group.key === 'penang' && (
          <p>
            Positions and elevations are approximate, as reported by the
            nodes themselves.
          </p>
        )}
        <div className="row">
          {group.sites.map((site) => (
                <div className="col col--6 margin-bottom--lg" key={site.shortName}>
                  <div className="card" style={{height: '100%'}}>
                    <div className="card__header">
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Heading as="h3" className="margin-bottom--none">
                          {site.name}
                        </Heading>
                        <code>{site.shortName}</code>
                      </div>
                      <p className="margin-bottom--none">
                        {site.area} · {siteElevation(site)} AMSL · Grid{' '}
                        {site.grid}
                      </p>
                    </div>
                    <div
                      className="card__body"
                      style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem'}}>
                      {site.bands.map((band) => {
                        const status = STATUS[band.status || 'active'];
                        return (
                          <div
                            key={band.freq}
                            style={{
                              flex: '1 1 200px',
                              border: '1px solid var(--ifm-color-emphasis-300)',
                              borderRadius: 'var(--ifm-card-border-radius)',
                              padding: '0.75rem',
                              background: 'var(--ifm-color-emphasis-100)',
                            }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem',
                              }}>
                              <strong
                                style={
                                  status.mark === 'retired'
                                    ? {color: 'var(--mm-muted)', textDecoration: 'line-through'}
                                    : undefined
                                }>
                                {band.freq}
                              </strong>
                              <span className="mm-status">
                                <i className={`mm-marker mm-marker--${status.mark}`}>
                                  <i className="mm-marker__pin" />
                                </i>
                                {status.label}
                              </span>
                            </div>
                            {band.statusNote && (
                              <p className="margin-bottom--sm">
                                <em>{band.statusNote}</em>
                              </p>
                            )}
                            <div
                              style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--ifm-color-emphasis-600)',
                              }}>
                              Hardware
                            </div>
                            <p className="margin-bottom--sm">
                              {band.hardwareUrl ? (
                                <a
                                  href={band.hardwareUrl}
                                  target="_blank"
                                  rel="noreferrer">
                                  {band.hardware} ↗
                                </a>
                              ) : (
                                band.hardware
                              )}
                            </p>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--ifm-color-emphasis-600)',
                              }}>
                              Antenna
                            </div>
                            <p className="margin-bottom--none">{band.antenna}</p>
                            {band.antennaPart !== UNKNOWN && (
                            <p className="margin-bottom--none">
                              {band.antennaUrl ? (
                                <a
                                  href={band.antennaUrl}
                                  target="_blank"
                                  rel="noreferrer">
                                  {band.antennaPart} ↗
                                </a>
                              ) : (
                                band.antennaPart
                              )}
                            </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="card__footer">
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <a
                          className="button button--secondary"
                          style={{flex: 1}}
                          href={googleMapsUrl(site.lat, site.lon)}
                          target="_blank"
                          rel="noreferrer">
                          {site.approx ? 'Approximate location' : 'Google Maps'}
                        </a>
                        <a
                          className="button button--secondary"
                          style={{flex: 1}}
                          href={meshmapUrl(site.meshmapId)}
                          target="_blank"
                          rel="noreferrer">
                          Mesh Map
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
          </section>
        ))}

        <Heading as="h2">Get help</Heading>
        <p>
          Interested in helping build or maintain a site, or want to
          propose a new location? Check our{' '}
          <a href="/events">events page</a> for upcoming meetups, or
          browse the community's repositories on{' '}
          <a href="https://github.com/meshmy" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </main>
    </Layout>
  );
}
