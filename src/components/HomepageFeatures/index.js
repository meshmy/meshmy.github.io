import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Off-Grid Communication',
    description: (
      <>
        Meshtastic radios let you send messages without cell towers or
        internet, using long-range LoRa mesh networking.
      </>
    ),
  },
  {
    title: 'Community Driven',
    description: (
      <>
        MeshMY brings together local mesh network builders to share nodes,
        coverage maps, and hardware builds.
      </>
    ),
  },
  {
    title: 'Open Source',
    description: (
      <>
        Built on the open source Meshtastic firmware and apps, with a
        community that welcomes contributions from anyone.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
