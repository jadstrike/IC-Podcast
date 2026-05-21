'use client'

interface RecordButtonProps {
  label?: string
  onClick?: () => void
  disabled?: boolean
}

export default function RecordButton({ label = 'Start Recording', onClick, disabled = false }: RecordButtonProps) {
  return (
    <div className="rec-shell">
      <button className="rec-btn" type="button" onClick={onClick} disabled={disabled}>
        <div className="inner">
          <div className="dotrec" />
          <div className="square" />
          <div className="rec-text">{label}</div>
        </div>
      </button>
    </div>
  )
}
