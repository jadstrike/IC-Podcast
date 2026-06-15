import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('LoginView register flow', () => {
  it('clicking Create account tab switches to register form', async () => {
    const user = userEvent.setup()
    render(<LoginView />)
    await user.click(screen.getByText('Create account'))
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('register submit with missing fields shows fill-in error', async () => {
    const user = userEvent.setup()
    render(<LoginView />)
    await user.click(screen.getByText('Create account'))
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert').textContent).toMatch(/Please fill in all fields/i)
  })

  it('register submit with invalid email shows email error', async () => {
    const user = userEvent.setup()
    render(<LoginView />)
    await user.click(screen.getByText('Create account'))
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getAllByLabelText(/email/i)[0]
    await user.type(nameInput, 'John')
    await user.type(emailInput, 'notanemail')
    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, 'somepassword')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByRole('alert').textContent).toMatch(/Enter a valid email/i)
  })

  it('register submit with 9-char password shows length error', async () => {
    const user = userEvent.setup()
    render(<LoginView />)
    await user.click(screen.getByText('Create account'))
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getAllByLabelText(/email/i)[0]
    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(nameInput, 'John')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, '123456789')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByRole('alert').textContent).toMatch(/Password must be at least 10 characters/i)
  })

  it('register submit with valid fields navigates to /lobby', async () => {
    const user = userEvent.setup()
    render(<LoginView />)
    await user.click(screen.getByText('Create account'))
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getAllByLabelText(/email/i)[0]
    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, '1234567890')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(pushMock).toHaveBeenCalledWith('/lobby')
  })
})
