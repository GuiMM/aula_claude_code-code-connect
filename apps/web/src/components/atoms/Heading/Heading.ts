import { cva, type VariantProps } from 'class-variance-authority'

const headingVariants = cva('text-white', {
  variants: {
    level: {
      1: 'text-2xl font-bold',
      2: 'text-lg font-semibold',
      3: 'text-base font-medium',
    },
  },
  defaultVariants: { level: 1 },
})

export type HeadingLevel = NonNullable<VariantProps<typeof headingVariants>['level']>

export interface HeadingProps {
  text: string
  level?: HeadingLevel
}

export function Heading({ text, level = 1 }: HeadingProps): HTMLHeadingElement {
  const el = document.createElement(`h${level}`) as HTMLHeadingElement
  el.textContent = text
  el.className = headingVariants({ level })
  return el
}
