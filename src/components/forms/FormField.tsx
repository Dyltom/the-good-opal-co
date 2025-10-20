import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/**
 * Form Field Props
 */
interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'url' | 'textarea'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  touched?: boolean
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helpText?: string
  className?: string
}

/**
 * FormField Component
 * Reusable form field with label, input, and error display
 * DRY component for consistent form UX
 */
export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched = false,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  className,
}: FormFieldProps) {
  const showError = touched && error
  const InputComponent = type === 'textarea' ? Textarea : Input

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <InputComponent
        id={name}
        name={name}
        type={type === 'textarea' ? undefined : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(showError && 'border-destructive focus-visible:ring-destructive')}
        aria-invalid={showError ? true : undefined}
        aria-describedby={
          showError ? `${name}-error` : helpText ? `${name}-help` : undefined
        }
        {...(type === 'textarea' && { rows: 5 })}
      />

      {helpText && !showError && (
        <p id={`${name}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}

      {showError && (
        <p id={`${name}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
