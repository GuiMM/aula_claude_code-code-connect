export type HeadingLevel = 1 | 2 | 3

export interface HeadingProps {
  text: string
  level?: HeadingLevel
}

export function Heading({ text, level = 1 }: HeadingProps): HTMLHeadingElement {
  const el = document.createElement(`h${level}`) as HTMLHeadingElement
  el.textContent = text

  const sizeMap: Record<HeadingLevel, string> = {
    1: 'text-2xl font-bold text-white',
    2: 'text-lg font-semibold text-white',
    3: 'text-base font-medium text-white',
  }

  el.className = sizeMap[level]
  return el
}
