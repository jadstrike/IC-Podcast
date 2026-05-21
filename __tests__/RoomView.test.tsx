import { render, screen, fireEvent, act } from '@testing-library/react'
import RoomView from '@/components/RoomView'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  act(() => {
    jest.runAllTimers()
  })
  jest.useRealTimers()
})

function getRoomDiv() {
  return document.querySelector('.room') as HTMLElement
}

describe('RoomView state machine', () => {
  it('renders with class "room" (no extra modifier) on mount', () => {
    render(<RoomView />)
    const room = getRoomDiv()
    expect(room).not.toBeNull()
    expect(room.className).toBe('room')
  })

  it('transitions idle -> recording after 4 seconds of countdown', () => {
    render(<RoomView />)
    const startBtn = screen.getByRole('button', { name: /Start Recording/i })
    act(() => {
      fireEvent.click(startBtn)
    })
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    const room = getRoomDiv()
    expect(room.className).toBe('room recording')
  })

  it('transitions recording -> uploading when record clicked during recording', () => {
    render(<RoomView />)
    const startBtn = screen.getByRole('button', { name: /Start Recording/i })
    act(() => {
      fireEvent.click(startBtn)
    })
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    const stopBtn = screen.getByRole('button', { name: /Stop/i })
    act(() => {
      fireEvent.click(stopBtn)
    })
    const room = getRoomDiv()
    expect(room.className).toBe('room uploading')
  })

  it('transitions uploading -> mixing after 2 seconds', () => {
    render(<RoomView />)
    const startBtn = screen.getByRole('button', { name: /Start Recording/i })
    act(() => {
      fireEvent.click(startBtn)
    })
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    const stopBtn = screen.getByRole('button', { name: /Stop/i })
    act(() => {
      fireEvent.click(stopBtn)
    })
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    const room = getRoomDiv()
    expect(room.className).toBe('room mixing')
  })

  it('transitions mixing -> ready after another 2 seconds', () => {
    render(<RoomView />)
    const startBtn = screen.getByRole('button', { name: /Start Recording/i })
    act(() => {
      fireEvent.click(startBtn)
    })
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    const stopBtn = screen.getByRole('button', { name: /Stop/i })
    act(() => {
      fireEvent.click(stopBtn)
    })
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    const room = getRoomDiv()
    expect(room.className).toBe('room ready')
  })

  it('transitions ready -> idle when record clicked in ready state', () => {
    render(<RoomView />)
    const startBtn = screen.getByRole('button', { name: /Start Recording/i })
    act(() => {
      fireEvent.click(startBtn)
    })
    act(() => {
      jest.advanceTimersByTime(4000)
    })
    const stopBtn = screen.getByRole('button', { name: /Stop/i })
    act(() => {
      fireEvent.click(stopBtn)
    })
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    const restartBtn = screen.getByRole('button', { name: /Start Recording/i })
    act(() => {
      fireEvent.click(restartBtn)
    })
    const room = getRoomDiv()
    expect(room.className).toBe('room')
  })

  it('shows correct state-label across states', () => {
    render(<RoomView />)
    expect(screen.getByText('Idle', { selector: '.state-label' })).toBeInTheDocument()

    const startBtn = screen.getByRole('button', { name: /Start Recording/i })
    act(() => {
      fireEvent.click(startBtn)
    })
    expect(screen.getByText('Get ready', { selector: '.state-label' })).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(4000)
    })
    expect(screen.getByText('Recording', { selector: '.state-label' })).toBeInTheDocument()

    const stopBtn = screen.getByRole('button', { name: /Stop/i })
    act(() => {
      fireEvent.click(stopBtn)
    })
    expect(screen.getByText('Uploading', { selector: '.state-label' })).toBeInTheDocument()
  })
})
