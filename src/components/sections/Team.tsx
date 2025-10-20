import Image from 'next/image'
import { Container, Grid, Section } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import { EmailIcon, LinkedInIcon, TwitterIcon } from '@/components/icons'
import type { TeamMember } from '@/types'

/**
 * Team Section Props
 */
interface TeamSectionProps {
  title?: string
  description?: string
  members: Array<Pick<TeamMember, 'name' | 'slug' | 'role' | 'bio' | 'avatar' | 'email' | 'social'>>
  columns?: 2 | 3 | 4
  showBio?: boolean
  showContact?: boolean
}

/**
 * Team Section Component
 * Display team members in a grid
 */
export function Team({
  title = 'Our Team',
  description,
  members,
  columns = 3,
  showBio = true,
  showContact = true,
}: TeamSectionProps) {
  if (members.length === 0) return null

  return (
    <Section padding="lg">
      <Container>
        <SectionHeader title={title} description={description} />

        {/* Team Grid */}
        <Grid cols={columns} gap="lg">
          {members.map((member) => (
            <Card key={member.slug} className="p-6 text-center">
              {/* Avatar */}
              {member.avatar && (
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={member.avatar.url}
                    alt={member.avatar.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Name & Role */}
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{member.role}</p>

              {/* Bio */}
              {showBio && member.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{member.bio}</p>
              )}

              {/* Contact & Social */}
              {showContact && (
                <div className="flex justify-center gap-3 mt-4">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Email ${member.name}`}
                    >
                      <EmailIcon />
                    </a>
                  )}
                  {member.social?.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <LinkedInIcon />
                    </a>
                  )}
                  {member.social?.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`${member.name} on Twitter`}
                    >
                      <TwitterIcon />
                    </a>
                  )}
                </div>
              )}
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
