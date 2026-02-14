import { RefObject, useEffect } from 'react'

const getFocusableElements = (root: HTMLElement) => {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  )
}

export function useModalA11y(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement>,
  initialFocusRef?: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen) return

    const container = containerRef.current
    if (!container) return

    const previousFocused = document.activeElement as HTMLElement | null
    const focusable = getFocusableElements(container)
    const initialTarget = initialFocusRef?.current || focusable[0] || container
    initialTarget.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const elements = getFocusableElements(container)
      if (elements.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocused?.focus()
    }
  }, [isOpen, onClose, containerRef, initialFocusRef])
}
