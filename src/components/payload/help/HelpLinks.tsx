import Link from 'next/link'
import { HELP_LINKS, HELP_PATH, type HelpTopic } from './help-links'
import styles from './Help.module.css'

export function HelpLinks({ topic }: { topic: HelpTopic }) {
  return (
    <p className={styles.links}>
      <span className={styles.linksLabel}>How to:</span>
      {HELP_LINKS[topic].map((link) => (
        <Link key={link.anchor} href={`${HELP_PATH}#${link.anchor}`} prefetch={false}>
          {link.label}
        </Link>
      ))}
    </p>
  )
}

export function HelpDashboardLink() {
  return (
    <p className={styles.dashboard}>
      New to the admin, or stuck on a job? <Link href={HELP_PATH} prefetch={false}>Read the owner guide</Link>
    </p>
  )
}
