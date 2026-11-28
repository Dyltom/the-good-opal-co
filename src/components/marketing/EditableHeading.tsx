import type { Heading } from '@/lib/site-content'

export function EditableHeading({ heading }: { heading: Heading }) {
  return (
    <>
      {heading.text}
      {heading.text && heading.italic ? ' ' : null}
      {heading.italic ? <i>{heading.italic}</i> : null}
    </>
  )
}
