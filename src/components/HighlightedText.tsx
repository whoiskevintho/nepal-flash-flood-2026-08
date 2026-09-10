import type { ReactNode } from 'react'

type HighlightColor = 'red' | 'yellow'

const HIGHLIGHT_PATTERN = /\[\[(red|yellow):([\s\S]*?)\]\]/g

type HighlightedTextProps = {
  text: string
  className?: string
}

export function HighlightedText({ text, className }: HighlightedTextProps) {
  const parts: Array<string | ReactNode> = []
  let lastIndex = 0
  let key = 0

  for (const match of text.matchAll(HIGHLIGHT_PATTERN)) {
    const matchIndex = match.index ?? 0

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex))
    }

    parts.push(
      <mark key={key} className={`text-highlight text-highlight-${match[1] as HighlightColor}`}>
        {match[2]}
      </mark>,
    )
    key += 1
    lastIndex = matchIndex + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  if (className) {
    return <span className={className}>{parts}</span>
  }

  return <>{parts}</>
}
