import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRandomMotivationalMessage,
  formatMotivationalMessage,
  MOTIVATIONAL_MESSAGES,
  completionSound,
  COMPLETE_SOUND_DATA_URI
} from './motivation'

describe('Motivation Utilities', () => {
  describe('getRandomMotivationalMessage', () => {
    beforeEach(() => {
      // Mock Math.random to return a fixed value
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return a motivational message', () => {
      const message = getRandomMotivationalMessage()
      expect(message).toBeDefined()
      expect(message).toHaveProperty('message')
    })

    it('should return a message from the MOTIVATIONAL_MESSAGES array', () => {
      const expectedIndex = Math.floor(0.5 * MOTIVATIONAL_MESSAGES.length)
      const expectedMessage = MOTIVATIONAL_MESSAGES[expectedIndex]
      const message = getRandomMotivationalMessage()
      expect(message).toEqual(expectedMessage)
    })
  })

  describe('formatMotivationalMessage', () => {
    it('should format a message with an emoji', () => {
      const message = { message: 'Great job!', emoji: '🎉' }
      const formatted = formatMotivationalMessage(message)
      expect(formatted).toBe('🎉 Great job!')
    })

    it('should return just the message if no emoji is provided', () => {
      const message = { message: 'Great job!' }
      const formatted = formatMotivationalMessage(message)
      expect(formatted).toBe('Great job!')
    })
  })

  describe('completionSound', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.useRealTimers()
    })

    it('should create an audio element with the correct source', () => {
      const audioSpy = vi.spyOn(global, 'Audio')
      completionSound.play()
      expect(audioSpy).toHaveBeenCalledWith(COMPLETE_SOUND_DATA_URI)
    })

    it('should not play sound more than once within the minimum interval', () => {
      const audioSpy = vi.spyOn(global, 'Audio')
      
      // First play
      completionSound.play()
      expect(audioSpy).toHaveBeenCalledTimes(1)
      
      // Try to play again immediately
      completionSound.play()
      expect(audioSpy).toHaveBeenCalledTimes(1) // Should still be 1
      
      // Advance time by more than the minimum interval
      vi.advanceTimersByTime(1100)
      
      // Should be able to play again
      completionSound.play()
      expect(audioSpy).toHaveBeenCalledTimes(2)
    })
  })
})
