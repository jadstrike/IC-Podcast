interface AvatarProps {
  initials?: string
  empty?: boolean
  status?: 'online' | 'pending' | 'offline' | null
  size?: 'sm' | 'md'
}

export default function Avatar({ initials, empty = false, status }: AvatarProps) {
  const cls = ['avatar', empty ? 'empty' : ''].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      {empty ? '?' : (initials ?? '')}
      {status ? <span className={`status ${status}`} /> : null}
    </div>
  )
}
