import { render, screen } from '@testing-library/react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Avatar from '@/components/ui/Avatar'

describe('Button', () => {
  it('renders with base btn class', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: /click me/i })
    expect(btn).toHaveClass('btn')
  })

  it('adds primary class when variant="primary"', () => {
    render(<Button variant="primary">Primary</Button>)
    const btn = screen.getByRole('button', { name: /primary/i })
    expect(btn).toHaveClass('btn')
    expect(btn).toHaveClass('primary')
  })

  it('adds ghost class when variant="ghost"', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button', { name: /ghost/i })
    expect(btn).toHaveClass('btn')
    expect(btn).toHaveClass('ghost')
  })

  it('adds block class when block prop is true', () => {
    render(<Button block>Block</Button>)
    const btn = screen.getByRole('button', { name: /block/i })
    expect(btn).toHaveClass('btn')
    expect(btn).toHaveClass('block')
  })

  it('does not have primary or ghost class by default', () => {
    render(<Button>Default</Button>)
    const btn = screen.getByRole('button', { name: /default/i })
    expect(btn).not.toHaveClass('primary')
    expect(btn).not.toHaveClass('ghost')
  })
})

describe('Field', () => {
  it('renders wrapper with field class', () => {
    const { container } = render(<Field label="Email" name="email" />)
    const wrapper = container.querySelector('.field')
    expect(wrapper).toBeInTheDocument()
  })

  it('renders label text', () => {
    render(<Field label="Email" name="email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders input element', () => {
    render(<Field label="Email" name="email" type="email" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('label htmlFor matches input id', () => {
    render(<Field label="Email" id="my-email" name="email" />)
    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')
    expect(label).toHaveAttribute('for', 'my-email')
    expect(input).toHaveAttribute('id', 'my-email')
  })
})

describe('Avatar', () => {
  it('renders with avatar class', () => {
    const { container } = render(<Avatar initials="JR" />)
    const el = container.querySelector('.avatar')
    expect(el).toBeInTheDocument()
  })

  it('renders initials text', () => {
    render(<Avatar initials="JR" />)
    expect(screen.getByText('JR')).toBeInTheDocument()
  })

  it('adds empty class when empty=true', () => {
    const { container } = render(<Avatar empty />)
    const el = container.querySelector('.avatar')
    expect(el).toHaveClass('empty')
  })

  it('does not add empty class by default', () => {
    const { container } = render(<Avatar initials="JR" />)
    const el = container.querySelector('.avatar')
    expect(el).not.toHaveClass('empty')
  })

  it('renders status span with online class', () => {
    const { container } = render(<Avatar initials="JR" status="online" />)
    const status = container.querySelector('.status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveClass('online')
  })

  it('renders status span with pending class', () => {
    const { container } = render(<Avatar initials="JR" status="pending" />)
    const status = container.querySelector('.status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveClass('pending')
  })

  it('does not render status span when status is null', () => {
    const { container } = render(<Avatar initials="JR" status={null} />)
    const status = container.querySelector('.status')
    expect(status).not.toBeInTheDocument()
  })

  it('does not render status span when status is undefined', () => {
    const { container } = render(<Avatar initials="JR" />)
    const status = container.querySelector('.status')
    expect(status).not.toBeInTheDocument()
  })
})
