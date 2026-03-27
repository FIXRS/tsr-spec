import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  eyebrow: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    eyebrow: 'Why It Matters',
    title: 'The layer between chat and apps',
    description: (
      <>
        TSR is aimed at the tasks that are too structured for plain conversation
        but too lightweight to justify a bespoke application.
      </>
    ),
  },
  {
    eyebrow: 'Core Idea',
    title: 'Meaning over markup',
    description: (
      <>
        Assistants describe entities, views, actions, state, events, and patches.
        Runtimes decide how that should render on the host.
      </>
    ),
  },
  {
    eyebrow: 'Guardrails',
    title: 'Safety belongs in the protocol',
    description: (
      <>
        Confirmations, capabilities, provenance, and sandbox boundaries are part
        of the contract, not visual polish layered on later.
      </>
    ),
  },
];

function Feature({eyebrow, title, description}: FeatureItem) {
  return (
    <article className={styles.featureCard}>
      <p className={styles.featureEyebrow}>{eyebrow}</p>
      <div className={styles.featureCopy}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </article>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresIntro}>
          <Heading as="h2">What This Spec Is Trying To Get Right</Heading>
          <p>
            TSR is not trying to become a general-purpose UI framework. It is
            trying to give assistants a reliable way to form the right interface
            for the task at hand, with continuity and trust intact.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
