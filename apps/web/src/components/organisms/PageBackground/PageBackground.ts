export function PageBackground(): HTMLElement {
  /* background chain-link decoration not yet added — needs SVG asset */
  const el = document.createElement('div')
  el.className = 'min-h-screen w-full bg-bg-page flex items-center justify-center p-4'
  return el
}
