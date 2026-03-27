import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={clsx('container', styles.heroContent)}>
        <p className={styles.eyebrow}>Draft Specification</p>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroBody}>
          TSR is for the layer between chat and apps: compare views, review flows,
          forms, scheduling panels, triage boards, and other task-specific
          interfaces that assistants should be able to create on demand without
          falling back to raw UI code.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/">
            Read the Overview
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/introduction">
            Read the Introduction
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A shared protocol for assistants to generate safe, task-specific interfaces at runtime.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
