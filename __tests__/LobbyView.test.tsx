import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LobbyView from '@/components/LobbyView'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
  pushMock.mockClear()
})

describe('LobbyView', () => {
  it('renders the headline with "Waiting for your"', () => {
    render(<LobbyView />)
    expect(screen.getByText(/Waiting for your/i)).toBeInTheDocument()
  })

  it('renders the italic co-host. accent', () => {
    render(<LobbyView />)
    const italic = screen.getByText(/co-host\./i)
    expect(italic.tagName.toLowerCase()).toBe('i')
  })

  it('renders the seat label "June Reyes"', () => {
    render(<LobbyView />)
    expect(screen.getByText('June Reyes')).toBeInTheDocument()
  })

  it('renders the seat label "Co-host"', () => {
    render(<LobbyView />)
    expect(screen.getByText('Co-host')).toBeInTheDocument()
  })

  it('second seat avatar has empty class', () => {
    const { container } = render(<LobbyView />)
    const emptyAvatar = container.querySelector('.avatar.empty')
    expect(emptyAvatar).toBeInTheDocument()
  })

  it('clicking Both joined button calls router.push with /room', async () => {
    const user = userEvent.setup()
    render(<LobbyView />)
    await user.click(screen.getByRole('button', { name: /both joined/i }))
    expect(pushMock).toHaveBeenCalledWith('/room')
  })

  it('clicking Leave room calls router.push with /login', async () => {
    const user = userEvent.setup()
    render(<LobbyView />)
    await user.click(screen.getByText(/← Leave room/i))
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})
