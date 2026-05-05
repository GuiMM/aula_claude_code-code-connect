import { Label } from '../../atoms/Label/Label'
import { Input, type InputProps } from '../../atoms/Input/Input'

export interface FormFieldProps extends InputProps {
  label: string
}

export function FormField({ label, ...inputProps }: FormFieldProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-2'

  const id = inputProps.id ?? inputProps.name

  wrapper.appendChild(Label({ text: label, htmlFor: id }))
  wrapper.appendChild(Input({ ...inputProps, id }))

  return wrapper
}
