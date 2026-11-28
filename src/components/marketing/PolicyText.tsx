import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { cn } from '@/lib/utils'

export function PolicyText({
  body,
  className,
}: {
  body: SerializedEditorState
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose max-w-none text-[15px] leading-7 prose-headings:font-normal prose-headings:text-ink prose-h2:mb-3 prose-h2:mt-9 prose-h2:text-[1.5rem] prose-h2:leading-[1.15] prose-h3:mt-6 prose-h3:text-[1.15rem] prose-p:text-ink prose-a:text-accent prose-a:underline-offset-4 prose-strong:font-medium prose-strong:text-ink prose-ol:list-decimal prose-ul:list-disc prose-li:text-ink md:prose-h2:text-[1.75rem] [&>:first-child]:mt-0',
        className
      )}
    >
      <RichText data={body} />
    </div>
  )
}
