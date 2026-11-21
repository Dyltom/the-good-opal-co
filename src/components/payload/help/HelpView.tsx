import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { renderOwnerGuide } from '@/lib/owner-guide'
import { requireAdminViewUser } from '../admin-view-user'
import { HELP_PATH } from './help-links'
import styles from './Help.module.css'

export async function HelpView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  const user = requireAdminViewUser(req, HELP_PATH)
  const guide = user.role === 'admin' ? await renderOwnerGuide() : null

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter className={styles.view}>
        {guide ? (
          <div className={styles.layout}>
            <nav aria-label="Guide sections" className={styles.toc}>
              <p className={styles.tocTitle}>Sections</p>
              <ol>
                {guide.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title.replace(/^\d+\.\s+/, '')}</a>
                  </li>
                ))}
              </ol>
            </nav>
            <article className={styles.guide} dangerouslySetInnerHTML={{ __html: guide.html }} />
          </div>
        ) : (
          <p>Only admins can see the owner guide.</p>
        )}
      </Gutter>
    </DefaultTemplate>
  )
}
