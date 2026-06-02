import { Heading } from '../../atoms/Heading/Heading'
import { Button } from '../../atoms/Button/Button'
import { FormField } from '../../molecules/FormField/FormField'
import { FormTextArea } from '../../molecules/FormTextArea/FormTextArea'

export interface PublishFormData {
  title: string
  description: string
  content: string
  thumbnailUrl: string
}

export interface PublishFormProps {
  onSubmit?: (data: PublishFormData) => Promise<void> | void
}

export function PublishForm({ onSubmit }: PublishFormProps = {}): HTMLElement {
  const form = document.createElement('form')
  form.className = 'flex flex-col gap-6 w-full max-w-2xl'
  form.noValidate = true

  const header = document.createElement('div')
  header.className = 'flex flex-col gap-2'
  header.appendChild(Heading({ text: 'Publicar', level: 1 }))
  const subtitle = document.createElement('p')
  subtitle.textContent = 'Compartilhe seu conhecimento com a comunidade.'
  subtitle.className = 'text-2xl text-text-primary'
  header.appendChild(subtitle)

  const fields = document.createElement('div')
  fields.className = 'flex flex-col gap-4'
  fields.appendChild(FormField({ label: 'Título', name: 'title', placeholder: 'Título do post' }))
  fields.appendChild(FormField({ label: 'Descrição', name: 'description', placeholder: 'Uma breve descrição do post' }))
  fields.appendChild(
    FormTextArea({ label: 'Conteúdo', name: 'content', placeholder: 'Escreva o conteúdo aqui...', rows: 8 }),
  )
  fields.appendChild(
    FormField({ label: 'Imagem de capa (URL)', name: 'thumbnailUrl', placeholder: 'https://exemplo.com/imagem.png' }),
  )

  const errorEl = document.createElement('p')
  errorEl.setAttribute('data-error', '')
  errorEl.className = 'text-sm text-red-400 hidden'

  const submitBtn = Button({ label: 'Publicar', iconAfter: 'arrow_forward', type: 'submit', variant: 'primary' })

  form.appendChild(header)
  form.appendChild(fields)
  form.appendChild(errorEl)
  form.appendChild(submitBtn)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(form)
    errorEl.textContent = ''
    errorEl.classList.add('hidden')
    submitBtn.disabled = true

    try {
      await onSubmit?.({
        title: (data.get('title') as string) ?? '',
        description: (data.get('description') as string) ?? '',
        content: (data.get('content') as string) ?? '',
        thumbnailUrl: (data.get('thumbnailUrl') as string) ?? '',
      })
    } catch (err) {
      errorEl.textContent = err instanceof Error ? err.message : 'Erro ao publicar o post.'
      errorEl.classList.remove('hidden')
    } finally {
      submitBtn.disabled = false
    }
  })

  return form
}
