// Sound service for playing audio notifications

// Define sound types
export type SoundType = 'success' | 'error' | 'notification'

// Sound file URLs
const SOUND_FILES = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  notification: '/sounds/notification.mp3'
}

// Audio instances for each sound type
const audioInstances: Record<SoundType, HTMLAudioElement | null> = {
  success: null,
  error: null,
  notification: null
}

// Initialize the sound service
export const initSoundService = (): void => {
  // Create audio elements for each sound type
  Object.entries(SOUND_FILES).forEach(([type, url]) => {
    const audio = new Audio(url)
    audio.preload = 'auto'
    audioInstances[type as SoundType] = audio
  })
}

// Play a sound
export const playSound = (type: SoundType): void => {
  const audio = audioInstances[type]
  
  if (audio) {
    // Reset the audio to the beginning if it's already playing
    audio.pause()
    audio.currentTime = 0
    
    // Play the sound
    audio.play().catch(error => {
      console.error(`Failed to play ${type} sound:`, error)
    })
  } else {
    console.warn(`Sound ${type} not initialized`)
  }
}

export default {
  initSoundService,
  playSound
}

