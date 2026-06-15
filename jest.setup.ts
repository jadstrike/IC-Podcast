import '@testing-library/jest-dom'

// crypto.randomUUID — JSDOM doesn't implement it
if (typeof global.crypto === 'undefined') {
  ;(global as unknown as { crypto: unknown }).crypto = {}
}
if (!global.crypto.randomUUID) {
  Object.defineProperty(global.crypto, 'randomUUID', {
    value: () => '00000000-0000-4000-8000-000000000000',
    writable: true,
    configurable: true,
  })
}

// navigator.mediaDevices — not available in JSDOM
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [] }),
  },
  configurable: true,
  writable: true,
})

// MediaRecorder — not available in JSDOM
class MockMediaRecorder {
  ondataavailable: ((e: Event) => void) | null = null
  onstop: (() => void) | null = null
  mimeType = 'audio/webm'
  start() {}
  stop() {
    this.onstop?.()
  }
}
Object.defineProperty(global, 'MediaRecorder', {
  value: MockMediaRecorder,
  writable: true,
  configurable: true,
})

// AudioContext — not available in JSDOM
Object.defineProperty(global, 'AudioContext', {
  value: jest.fn().mockImplementation(() => ({
    decodeAudioData: jest.fn().mockResolvedValue({
      numberOfChannels: 1,
      sampleRate: 44100,
      getChannelData: () => new Float32Array(0),
      duration: 0,
    }),
    close: jest.fn().mockResolvedValue(undefined),
  })),
  writable: true,
  configurable: true,
})

// URL object methods — may be missing in JSDOM
if (!URL.createObjectURL) {
  URL.createObjectURL = jest.fn(() => 'blob:mock')
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = jest.fn()
}
