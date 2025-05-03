import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMotivation } from './useMotivation'
import * as motivationUtils from '../utils/motivation'
import toast from 'react-hot-toast'

// Mock the entire react-hot-toast module
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('useMotivation hook', () => {
  beforeEach(() => {
    // Mock the motivation utilities
    vi.spyOn(motivationUtils, 'getRandomMotivationalMessage').mockReturnValue({
      message: 'Great job!',
      emoji: '🎉'
    })
    
    vi.spyOn(motivationUtils, 'formatMotivationalMessage').mockReturnValue(
      '🎉 Great job!'
    )
    
    vi.spyOn(motivationUtils.completionSound, 'play').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return a celebrateCompletion function', () => {
    const { result } = renderHook(() => useMotivation())
    expect(result.current.celebrateCompletion).toBeInstanceOf(Function)
  })

  it('should call toast.success and play sound when celebrating completion', () => {
    const { result } = renderHook(() => useMotivation())
    
    act(() => {
      result.current.celebrateCompletion()
    })
    
    // Verify toast.success was called with the formatted message
    expect(toast.success).toHaveBeenCalledWith('🎉 Great job!', expect.any(Object))
    
    // Verify sound was played
    expect(motivationUtils.completionSound.play).toHaveBeenCalledTimes(1)
  })

  it('should use toast options for styling', () => {
    const { result } = renderHook(() => useMotivation())
    
    act(() => {
      result.current.celebrateCompletion()
    })
    
    // Verify toast.success was called with the correct styling options
    expect(toast.success).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        duration: expect.any(Number),
        position: 'bottom-center',
        style: expect.objectContaining({
          background: expect.any(String),
          color: expect.any(String)
        })
      })
    )
  })
})
