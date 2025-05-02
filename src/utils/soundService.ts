// Sound service for playing notification sounds

// Define the available sounds
const sounds = {
  success: new Audio('/sounds/success.mp3'),
  error: new Audio('/sounds/error.mp3'),
  notification: new Audio('/sounds/notification.mp3')
}

// Preload sounds
Object.values(sounds).forEach(sound => {
  sound.load()
})

// Function to play a sound
export const playSound = (soundName: keyof typeof sounds) => {
  try {
    const sound = sounds[soundName]
    
    // Reset the sound to the beginning if it's already playing
    sound.currentTime = 0
    
    // Play the sound
    sound.play().catch(error => {
      // Handle autoplay restrictions
      console.warn(`Failed to play sound: ${error.message}`)
    })
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

// Function to check if sounds are available/enabled
export const areSoundsAvailable = (): boolean => {
  return !document.hidden && !document.visibilityState || document.visibilityState === 'visible'
}

// Function to initialize the sound service
export const initSoundService = () => {
  // Create a user interaction event listener to enable sounds
  // (browsers require user interaction before playing audio)
  const enableSounds = () => {
    // Try to play and immediately pause a sound to enable audio
    const sound = sounds.notification
    sound.volume = 0
    sound.play().then(() => {
      sound.pause()
      sound.currentTime = 0
      sound.volume = 1
    }).catch(() => {
      // Ignore errors - we'll try again on the next user interaction
    })
  }

  // Add event listeners for user interactions
  document.addEventListener('click', enableSounds, { once: true })
  document.addEventListener('keydown', enableSounds, { once: true })
  document.addEventListener('touchstart', enableSounds, { once: true })
}

export default {
  playSound,
  areSoundsAvailable,
  initSoundService
}

