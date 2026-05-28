'use client'

import { useRef, useCallback } from 'react'

interface LongPressOptions {
  threshold?: number // ms before fire
  onStart?: () => void
  onCancel?: () => void
}

/**
 * Cross-input long-press hook.
 * - Touch: fires after `threshold` ms held; cancels on move > 8px or up.
 * - Mouse: fires on right-click (contextmenu) for desktop discoverability.
 *
 * Returns a set of handlers to spread on the target element.
 */
export function useLongPress(callback: (e: React.SyntheticEvent) => void, opts: LongPressOptions = {}) {
  const { threshold = 450, onStart, onCancel } = opts
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)
  const firedRef = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startPos.current = null
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      firedRef.current = false
      const t = e.touches[0]
      startPos.current = { x: t.clientX, y: t.clientY }
      onStart?.()
      timerRef.current = setTimeout(() => {
        firedRef.current = true
        callback(e)
      }, threshold)
    },
    [callback, threshold, onStart]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startPos.current) return
      const t = e.touches[0]
      const dx = Math.abs(t.clientX - startPos.current.x)
      const dy = Math.abs(t.clientY - startPos.current.y)
      if (dx > 8 || dy > 8) {
        clear()
        onCancel?.()
      }
    },
    [clear, onCancel]
  )

  const onTouchEnd = useCallback(() => {
    clear()
  }, [clear])

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      callback(e)
    },
    [callback]
  )

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: onTouchEnd,
    onContextMenu,
    // expose whether the last touch was a long-press so consumers can suppress
    // the subsequent click event
    didFire: () => firedRef.current,
  }
}
