import axe from 'axe-core'
import type { AxeResults, RunOptions } from 'axe-core'

const WCAG_AA: RunOptions = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
}

export async function runA11y(
  element: HTMLElement,
  options: RunOptions = {},
): Promise<AxeResults> {
  const container = document.createElement('div')
  document.body.appendChild(container)
  container.appendChild(element)

  try {
    return await axe.run(container, { ...WCAG_AA, ...options })
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
  }
}

export function formatViolations(results: AxeResults): string {
  if (!results.violations.length) return 'Nenhuma violação encontrada.'

  const lines: string[] = [
    `\n${'─'.repeat(60)}`,
    `${results.violations.length} VIOLAÇÃO(ÕES) WCAG 2 AA ENCONTRADA(S)`,
    `${'─'.repeat(60)}`,
  ]

  results.violations.forEach((v, i) => {
    const criteria = v.tags.filter(t => /^wcag\d/.test(t)).join(', ')
    lines.push(`\n${i + 1}. [${(v.impact ?? 'unknown').toUpperCase()}] ${v.id}`)
    lines.push(`   Descrição : ${v.help}`)
    lines.push(`   Critério  : ${criteria}`)
    lines.push(`   Ref       : ${v.helpUrl}`)
    lines.push(`   Elementos (${v.nodes.length}):`)
    v.nodes.forEach(n => {
      lines.push(`     • Seletor: ${n.target.join(' ')}`)
      const summary = n.failureSummary?.split('\n')[0] ?? ''
      if (summary) lines.push(`       ${summary}`)
    })
  })

  lines.push(`\n${'─'.repeat(60)}`)
  return lines.join('\n')
}

/**
 * Loga no console as regras que o axe não conseguiu verificar automaticamente
 * (requerem navegador real com CSS computado — use Playwright para cobri-las).
 */
export function warnIncomplete(results: AxeResults): void {
  if (!results.incomplete.length) return

  const lines = [
    `\n⚠️  ${results.incomplete.length} ITEM(NS) REQUER(EM) VERIFICAÇÃO MANUAL / NAVEGADOR REAL`,
    `   (happy-dom não computa estilos CSS — use Playwright para cobrir estes critérios)`,
  ]

  results.incomplete.forEach((v, i) => {
    const criteria = v.tags.filter(t => /^wcag\d/.test(t)).join(', ')
    lines.push(`\n   ${i + 1}. ${v.id}: ${v.help} [${criteria}]`)
    v.nodes.forEach(n => {
      lines.push(`      → ${n.target.join(' ')}`)
      if (n.any?.length) lines.push(`        ${n.any[0].message}`)
    })
  })

  console.warn(lines.join('\n'))
}
