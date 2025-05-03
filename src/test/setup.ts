import '@testing-library/jest-dom'

// Mock Audio and navigator.clipboard
class MockAudio {
  src: string
  play: () => Promise<void>
  pause: () => void

  constructor(src?: string) {
    this.src = src || ''
    this.play = vi.fn().mockResolvedValue(undefined)
    this.pause = vi.fn()
  }
}

// Add to global
global.Audio = MockAudio as any

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
}
global.localStorage = localStorageMock as any
