import { render, screen, fireEvent, act } from '@testing-library/react'
import LoginView from '@/components/LoginView'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

jest.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}))

beforeEach(() => {
  pushMock.mockClear()
})

describe('LoginView', () => {
  it('renders headline with Record and together text', () => {
    render(<LoginView />)
    expect(screen.getByText(/Record/i)).toBeInTheDocument()
    expect(screen.getByText(/together/i)).toBeInTheDocument()
  })

  it('shows error when submitting empty form', () => {
    render(<LoginView />)
    const button = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(button)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert').textContent).toMatch(/fill/i)
  })

  it('navigates to /lobby on valid submission', async () => {
    render(<LoginView />)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '0123456789' } })
    const button = screen.getByRole('button', { name: /sign in/i })
    await act(async () => {
      fireEvent.click(button)
    })
    expect(pushMock).toHaveBeenCalledWith('/lobby')
  })
})
