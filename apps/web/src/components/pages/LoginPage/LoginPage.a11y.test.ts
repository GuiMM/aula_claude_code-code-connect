import { describe, it, expect, beforeAll } from 'vitest'
import { runA11y, formatViolations, warnIncomplete } from '../../../tests/a11y-utils'
import { LoginPage } from './LoginPage'

describe('LoginPage – WCAG 2 AA (acessibilidade automatizada)', () => {
  beforeAll(() => {
    document.documentElement.setAttribute('lang', 'pt-BR')
    document.title = 'code connect – Login'
  })

  it('não possui violações de acessibilidade WCAG 2 AA', async () => {
    const results = await runA11y(LoginPage())
    warnIncomplete(results)
    expect(results.violations, formatViolations(results)).toHaveLength(0)
  })
})
