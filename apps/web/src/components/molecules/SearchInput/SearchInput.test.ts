import { describe, it, expect, vi } from 'vitest'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('renders an input element', () => {
    const wrapper = SearchInput({ onSearch: vi.fn() })
    const input = wrapper.querySelector('input')
    expect(input).not.toBeNull()
    expect(input?.type).toBe('search')
  })

  it('uses custom placeholder', () => {
    const wrapper = SearchInput({ placeholder: 'Pesquisar...', onSearch: vi.fn() })
    const input = wrapper.querySelector('input')!
    expect(input.placeholder).toBe('Pesquisar...')
  })

  it('renders search icon', () => {
    const wrapper = SearchInput({ onSearch: vi.fn() })
    expect(wrapper.querySelector('svg')).not.toBeNull()
  })

  it('calls onSearch after debounce on input event', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const wrapper = SearchInput({ onSearch, debounceMs: 100 })
    const input = wrapper.querySelector('input')!
    input.value = 'typescript'
    input.dispatchEvent(new Event('input'))
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(onSearch).toHaveBeenCalledWith('typescript')
    vi.useRealTimers()
  })
})
