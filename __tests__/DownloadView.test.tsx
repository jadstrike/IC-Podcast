import { render, screen, fireEvent, act } from '@testing-library/react'
import DownloadView from '@/components/DownloadView'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('DownloadView', () => {
  it('renders the headline containing "Your" and "sessions."', () => {
    render(<DownloadView />)
    expect(screen.getByText(/Your/)).toBeInTheDocument()
    expect(screen.getByText(/sessions\./)).toBeInTheDocument()
  })

  it('renders at least four rec-row rows with placeholder data', () => {
    const { container } = render(<DownloadView />)
    const rows = container.querySelectorAll('.rec-row')
    expect(rows.length).toBeGreaterThanOrEqual(4)
  })

  it('shows the first placeholder session title', () => {
    render(<DownloadView />)
    expect(screen.getByText(/Orbit Drift, Ep\. 17/)).toBeInTheDocument()
  })

  it('navigates to /lobby when + New session is clicked', () => {
    const pushMock = jest.fn()
    jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(
      () => ({ push: pushMock })
    )
    render(<DownloadView />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /New session/i }))
    })
    expect(pushMock).toHaveBeenCalledWith('/lobby')
  })

  it('calls onNewSession when provided instead of router.push', () => {
    const onNewSession = jest.fn()
    render(<DownloadView onNewSession={onNewSession} />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /New session/i }))
    })
    expect(onNewSession).toHaveBeenCalledTimes(1)
  })

  it('does not throw when clicking download without onDownload handler', () => {
    const { container } = render(<DownloadView />)
    const dl = container.querySelector('.dl')
    expect(() => {
      act(() => {
        fireEvent.click(dl!)
      })
    }).not.toThrow()
  })

  it('renders session rows with guest and date info', () => {
    render(<DownloadView />)
    expect(screen.getAllByText(/Mira Senna/).length).toBeGreaterThan(0)
  })
})
