import { useState, useCallback, useMemo } from 'react'

/**
 * Form submission status
 */
export type FormStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Form state with values and errors
 */
export interface FormState<T extends Record<string, unknown>> {
  /** Current form field values */
  values: T
  /** Field-level error messages */
  errors: Partial<Record<keyof T, string>>
  /** Form submission status */
  status: FormStatus
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Whether form has been modified */
  isDirty: boolean
}

/**
 * Actions for managing form state
 */
export interface FormActions<T extends Record<string, unknown>> {
  /** Set a single field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void
  /** Set multiple field values at once */
  setValues: (values: Partial<T>) => void
  /** Set an error for a specific field */
  setError: <K extends keyof T>(field: K, error: string | undefined) => void
  /** Clear all errors */
  clearErrors: () => void
  /** Set form status */
  setStatus: (status: FormStatus) => void
  /** Reset form to initial state */
  reset: () => void
}

/**
 * Return type combining state and actions
 */
export type UseFormStateReturn<T extends Record<string, unknown>> = FormState<T> & FormActions<T>

/**
 * useFormState Hook
 *
 * A reusable hook for managing form state with type safety.
 * Handles form values, errors, validation, and submission status.
 *
 * @example Basic usage
 * ```tsx
 * type ContactForm = { name: string; email: string; message: string }
 *
 * function ContactForm() {
 *   const form = useFormState<ContactForm>({
 *     name: '',
 *     email: '',
 *     message: '',
 *   })
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault()
 *     form.setStatus('loading')
 *
 *     try {
 *       await submitForm(form.values)
 *       form.setStatus('success')
 *       form.reset()
 *     } catch (error) {
 *       form.setStatus('error')
 *       form.setError('email', 'Invalid email')
 *     }
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={form.values.name}
 *         onChange={(e) => form.setValue('name', e.target.value)}
 *       />
 *       {form.errors.name && <span>{form.errors.name}</span>}
 *       <button disabled={form.isSubmitting}>Submit</button>
 *     </form>
 *   )
 * }
 * ```
 *
 * @param initialValues - Initial form field values
 * @returns Form state and actions
 */
export function useFormState<T extends Record<string, unknown> = Record<string, unknown>>(
  initialValues: T = {} as T
): UseFormStateReturn<T> {
  // State
  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({})
  const [status, setStatusState] = useState<FormStatus>('idle')
  const [isDirty, setIsDirty] = useState(false)

  // Actions
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }, [])

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }))
    setIsDirty(true)
  }, [])

  const setError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrorsState((prev) => {
      if (error === undefined) {
        // Remove the field from errors
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
      return { ...prev, [field]: error }
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrorsState({})
  }, [])

  const setStatus = useCallback((newStatus: FormStatus) => {
    setStatusState(newStatus)
  }, [])

  const reset = useCallback(() => {
    setValuesState(initialValues)
    setErrorsState({})
    setStatusState('idle')
    setIsDirty(false)
  }, [initialValues])

  // Computed properties
  const isSubmitting = useMemo(() => status === 'loading', [status])

  return {
    // State
    values,
    errors,
    status,
    isSubmitting,
    isDirty,
    // Actions
    setValue,
    setValues,
    setError,
    clearErrors,
    setStatus,
    reset,
  }
}
