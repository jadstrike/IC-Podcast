interface FieldProps {
  label: string
  id?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  name?: string
  defaultValue?: string
  required?: boolean
}

export default function Field({ label, id, type = 'text', placeholder, autoComplete, name, defaultValue, required }: FieldProps) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  )
}
