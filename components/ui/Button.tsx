type ButtonVariant = 'default' | 'primary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  block?: boolean
}

export default function Button({ variant = 'default', block = false, className = '', ...props }: ButtonProps) {
  const cls = [
    'btn',
    variant === 'primary' ? 'primary' : '',
    variant === 'ghost' ? 'ghost' : '',
    block ? 'block' : '',
    className,
  ].filter(Boolean).join(' ')

  return <button className={cls} {...props} />
}
