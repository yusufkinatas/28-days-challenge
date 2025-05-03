import { useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  completionSound,
  formatMotivationalMessage,
  getRandomMotivationalMessage
} from '../utils/motivation'

/**
 * Hook for showing motivational notifications and playing sounds 
 * on challenge progress
 */
export function useMotivation() {
  /**
   * Show a motivational toast and play a sound when a user completes a challenge item
   */
  const celebrateCompletion = useCallback(() => {
    // Get a random motivational message
    const motivationalMessage = getRandomMotivationalMessage()
    
    // Show toast notification
    toast.success(formatMotivationalMessage(motivationalMessage), {
      duration: 3000,
      position: 'bottom-center',
      style: {
        background: '#4ade80',
        color: '#fff',
        fontWeight: 'bold',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    })
    
    // Play completion sound
    completionSound.play()
  }, [])

  return {
    celebrateCompletion
  }
}
