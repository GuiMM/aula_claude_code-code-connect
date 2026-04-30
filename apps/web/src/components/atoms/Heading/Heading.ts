export type HeadingLevel = 1 | 2 | 3

export interface HeadingProps {
  text: string
  level?: HeadingLevel
}

export function Heading({ text, level = 1 }: HeadingProps): HTMLHeadingElement {
  const el = document.createElement(`h${level}`) as HTMLHeadingElement
  el.textContent = text

  const sizeMap: Record<HeadingLevel, string> = {
    1: 'text-3xl font-semibold leading-normal text-text-primary',
    2: 'text-2xl leading-normal text-text-primary',
    3: 'text-lg font-semibold text-text-primary',
  }

  el.className = sizeMap[level]
  return el
}
