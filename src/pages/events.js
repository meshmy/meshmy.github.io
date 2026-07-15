import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const events = [
  {
    title: 'MeshMY Meetup',
    date: 'TBA',
    location: 'TBA',
    description:
      'Our next community meetup — details coming soon. Check back or watch our GitHub for announcements.',
  },
];

function EventCard({title, date, location, description}) {
  return (
    <div className="card margin-bottom--lg">
      <div className="card__header">
        <Heading as="h3">{title}</Heading>
      </div>
      <div className="card__body">
        <p>
          <strong>Date:</strong> {date}
          <br />
          <strong>Location:</strong> {location}
        </p>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Events() {
  return (
    <Layout
      title="Events"
      description="Upcoming MeshMY community events and meetups.">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h1">Events</Heading>
            <p>
              Upcoming meetups and events for the MeshMY community. Add your
              own events by editing{' '}
              <code>src/pages/events.js</code>.
            </p>
            {events.map((event, idx) => (
              <EventCard key={idx} {...event} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
