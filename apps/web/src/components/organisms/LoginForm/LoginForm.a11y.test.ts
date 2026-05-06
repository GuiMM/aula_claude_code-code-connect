import { describe, it, expect } from 'vitest'
import { runA11y, formatViolations, warnIncomplete } from '../../../tests/a11y-utils'
import { LoginForm } from './LoginForm'

describe('LoginForm – WCAG 2 AA (acessibilidade automatizada)', () => {
  it('não possui violações de acessibilidade WCAG 2 AA', async () => {
    const results = await runA11y(LoginForm())
    warnIncomplete(results)
    expect(results.violations, formatViolations(results)).toHaveLength(0)
  })
})
