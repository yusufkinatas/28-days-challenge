// Base64 encoded short "complete" sound 
export const COMPLETE_SOUND_DATA_URI = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gQXVkaW9NaWNyby5jb20AP/7aAYANAhAIBggKyAgICAgICA0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ3/wAARCAAbADADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDB0TSYxCmoeQS3lgyKQSCO9bNvFJJGHKt8oGQQMHFZljJcMkUUdtKxUeWSEOO9bFtOLW1jkuInCt8qEA5JPbNYVJy5rI5oQmqd2QXKrHIrFhnqOaqzQxsuRhGXkrjANalybcR+YGZ/QBc1z09/i8/0dCFYngnk1lGpJ6NnJCrKSs9CwEgeYNPsUjn5QfSugtbO3urVHDnZIMoccGuPvtThJLROrMDkLuyDUlh4t1Gxj8v92+PVuDXTCbS3O6E5vRmz48tIrO4iaOMqyqNx9TmuZM5VRhT/AMCGa0tc8SXWtuhkCRog+VVHesIykHpWLqJTTRxTjJzuWLbcq3EmTlh900zVRJBpzOjKfnA+UjNTKojsy+V8xzlRTNYYvp05XG3d0xVqSctBSk+XTuZcl7czDaWkI7BmyBTra5ltZxJBIyHuQcUyXDZ+lQnmujmsrnBq9WdVH441WOHaLiQ46b3zjFZl3qt/qJzc3Ejj0JOKqUVLnJ7szc5PdieY3rSFiepoopEhRRRQB//Z'

export type MotivationalMessage = {
  message: string
  emoji?: string
}

export const MOTIVATIONAL_MESSAGES: MotivationalMessage[] = [
  { message: 'Great job! Keep it up!', emoji: '🎉' },
  { message: 'Awesome work! You're making progress!', emoji: '💪' },
  { message: 'One step closer to your goal!', emoji: '🏆' },
  { message: 'Fantastic! You're building momentum!', emoji: '🚀' },
  { message: 'Well done! Consistency is key!', emoji: '✨' },
  { message: 'You're crushing it!', emoji: '💯' },
  { message: 'Keep the streak going!', emoji: '🔥' },
  { message: 'That's the spirit! You can do this!', emoji: '⭐' },
  { message: 'Excellent progress today!', emoji: '👏' },
  { message: 'You're on the right track!', emoji: '🌟' }
]

/**
 * Get a random motivational message from the list
 * @returns A random motivational message object
 */
export function getRandomMotivationalMessage(): MotivationalMessage {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
  return MOTIVATIONAL_MESSAGES[randomIndex]
}

/**
 * Formats a motivational message with its emoji
 * @param message The motivational message object
 * @returns Formatted message string with emoji
 */
export function formatMotivationalMessage(message: MotivationalMessage): string {
  if (message.emoji) {
    return `${message.emoji} ${message.message}`
  }
  return message.message
}

/**
 * Class to manage the playback of the completion sound
 * Ensures the sound can only be played once every given interval
 */
class SoundPlayer {
  private audio: HTMLAudioElement | null = null
  private lastPlayed: number = 0
  private minInterval: number = 1000 // Minimum time between sound plays in ms

  constructor(private soundSrc: string) {}

  play(): void {
    const now = Date.now()
    // Only play if enough time has passed since last play
    if (now - this.lastPlayed > this.minInterval) {
      try {
        // Create new audio instance each time to avoid issues with replaying
        this.audio = new Audio(this.soundSrc)
        this.audio.play()
        this.lastPlayed = now
      } catch (error) {
        console.error('Error playing sound:', error)
      }
    }
  }
}

// Export singleton instance
export const completionSound = new SoundPlayer(COMPLETE_SOUND_DATA_URI)
