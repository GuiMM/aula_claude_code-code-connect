import { Label } from '../../atoms/Label/Label'
import { TextArea, type TextAreaProps } from '../../atoms/TextArea/TextArea'

export interface FormTextAreaProps extends TextAreaProps {
  label: string
}

export function FormTextArea({ label, ...textAreaProps }: FormTextAreaProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-2'

  const id = textAreaProps.id ?? textAreaProps.name

  wrapper.appendChild(Label({ text: label, htmlFor: id }))
  wrapper.appendChild(TextArea({ ...textAreaProps, id }))

  return wrapper
}
