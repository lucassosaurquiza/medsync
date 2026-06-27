import { useEffect, useRef } from 'react'

function useSmartPolling (callback, intervalMs = 15000) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    let isRunning = false
    let activeController = null

    const execute = async () => {
      if (document.visibilityState !== 'visible' || isRunning) return

      isRunning = true
      activeController = new AbortController()

      try {
        await callbackRef.current(activeController.signal)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error al actualizar datos:', error)
        }
      } finally {
        isRunning = false
        activeController = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        execute()
      }
    }

    execute()

    const intervalId = window.setInterval(execute, intervalMs)

    window.addEventListener('focus', execute)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      activeController?.abort()
      window.removeEventListener('focus', execute)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [intervalMs])
}

export { useSmartPolling }