export interface CheckboxProps {
  label: string
  name: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export function Checkbox({ label, name, checked = false, onChange }: CheckboxProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex items-center gap-2'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.name = name
  input.id = name
  input.checked = checked
  input.className = 'accent-brand-green w-4 h-4 cursor-pointer'

  const labelEl = document.createElement('label')
  labelEl.htmlFor = name
  labelEl.textContent = label
  labelEl.className = 'text-[15px] text-text-muted cursor-pointer select-none'

  if (onChange) {
    input.addEventListener('change', () => onChange(input.checked))
  }

  wrapper.appendChild(input)
  wrapper.appendChild(labelEl)

  return wrapper
}
