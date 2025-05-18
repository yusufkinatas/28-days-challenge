// Motivational messages to display when completing challenges
export const motivationalMessages = [
  'Great job! Keep up the good work!',
  "You're making excellent progress!",
  "Keep it up - you're building a great habit!",
  'Another step toward your goal - well done!',
  "Consistency is key and you're nailing it!",
  "You're on fire! 🔥  Keep the streak going!",
  'Awesome work today; tomorrow will be even better!',
  'Small steps lead to big changes - nice work!',
  "That's the spirit; you're doing great!",
  'Proud of your commitment - keep going!'
]

// Get a random motivational message
export const getRandomMotivationalMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length)
  return motivationalMessages[randomIndex]
}

// Play a success sound
export const playSuccessSound = (): void => {
  const sound = new Audio('/sounds/success.mp3')
  sound.volume = 0.5
  sound.play().catch((error) => {
    console.error('Error playing sound:', error)
  })
}

// Show a toast notification with a motivational message
export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

export const createToast = (
  message: string,
  type: ToastType = 'success',
  duration: number = 3000
): Toast => {
  return {
    id: Date.now().toString(),
    message,
    type,
    duration
  }
}
