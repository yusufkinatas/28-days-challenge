// Collection of motivational messages to display to users

export const motivationalMessages = [
  "Great job! Keep up the good work!",
  "You're making excellent progress!",
  "Way to go! You're on a roll!",
  "Awesome! You're crushing this challenge!",
  "Fantastic work! You're building great habits!",
  "You're doing amazing! Keep it up!",
  "Excellent! Your consistency is impressive!",
  "Bravo! You're one step closer to your goal!",
  "Incredible progress! You should be proud!",
  "Well done! Your dedication is inspiring!",
  "You're nailing this challenge! Keep going!",
  "Superb! You're making it happen!",
  "Brilliant! Your commitment is paying off!",
  "Outstanding! You're building momentum!",
  "Terrific job! You're making a difference!",
  "Impressive work! You've got this!",
  "Amazing effort! Keep that streak going!",
  "Wonderful! You're creating positive change!",
  "Stellar performance! You're unstoppable!",
  "Excellent choice! Your future self thanks you!"
]

// Function to get a random motivational message
export const getRandomMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length)
  return motivationalMessages[randomIndex]
}

export default {
  motivationalMessages,
  getRandomMessage
}

