import { redirect } from 'next/navigation'
import RootPage from '@/app/page'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('RootPage', () => {
  it('redirects to /login', () => {
    RootPage()
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
