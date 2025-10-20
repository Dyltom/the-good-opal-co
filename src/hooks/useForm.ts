'use client'

import { useState, useCallback } from 'react'

/**
 * Form State
 */
interface FormState<T extends Record<string, unknown>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  dirty: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

/**
 * Form Validator Function
 */
type ValidatorFn<T> = (value: T) => string | undefined | Promise<string | undefined>

/**
 * Form Validators
 */
type Validators<T extends Record<string, unknown>> = Partial<
  Record<keyof T, ValidatorFn<T[keyof T]> | ValidatorFn<T[keyof T]>[]>
>

/**
 * useForm Hook
 * Reusable form state management with validation
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validators?: Validators<T>
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValid: true,
  })

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    async (name: keyof T, value: T[keyof T]): Promise<string | undefined> => {
      if (!validators || !validators[name]) return undefined

      const fieldValidators = validators[name]

      if (!fieldValidators) return undefined

      // Handle single validator
      if (typeof fieldValidators === 'function') {
        return await fieldValidators(value)
      }

      // Handle array of validators
      if (Array.isArray(fieldValidators)) {
        for (const validator of fieldValidators) {
          const error = await validator(value)
          if (error) return error
        }
      }

      return undefined
    },
    [validators]
  )

  /**
   * Validate all fields
   */
  const validateAll = useCallback(async (): Promise<boolean> => {
    if (!validators) return true

    const errors: Partial<Record<keyof T, string>> = {}
    let hasErrors = false

    for (const name of Object.keys(state.values) as Array<keyof T>) {
      const error = await validateField(name, state.values[name])
      if (error) {
        errors[name] = error
        hasErrors = true
      }
    }

    setState((prev) => ({
      ...prev,
      errors,
      isValid: !hasErrors,
    }))

    return !hasErrors
  }, [state.values, validateField, validators])

  /**
   * Set field value
   */
  const setFieldValue = useCallback(
    async (name: keyof T, value: T[keyof T]) => {
      // Validate field
      const error = await validateField(name, value)

      setState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [name]: value,
        },
        errors: {
          ...prev.errors,
          [name]: error,
        },
        dirty: {
          ...prev.dirty,
          [name]: value !== initialValues[name],
        },
        isValid: !error && Object.values(prev.errors).every((e) => !e),
      }))
    },
    [initialValues, validateField]
  )

  /**
   * Set field touched
   */
  const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
    setState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: touched,
      },
    }))
  }, [])

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (name: keyof T) => {
      setFieldTouched(name, true)
    },
    [setFieldTouched]
  )

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (name: keyof T) => (value: T[keyof T]) => {
      setFieldValue(name, value)
    },
    [setFieldValue]
  )

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      dirty: {},
      isSubmitting: false,
      isValid: true,
    })
  }, [initialValues])

  /**
   * Set multiple values at once
   */
  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        ...values,
      },
    }))
  }, [])

  /**
   * Set submitting state
   */
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState((prev) => ({
      ...prev,
      isSubmitting,
    }))
  }, [])

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => async (e: React.FormEvent) => {
      e.preventDefault()

      setSubmitting(true)

      const isValid = await validateAll()

      if (!isValid) {
        setSubmitting(false)
        return
      }

      try {
        await onSubmit(state.values)
      } finally {
        setSubmitting(false)
      }
    },
    [state.values, validateAll, setSubmitting]
  )

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    dirty: state.dirty,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setFieldValue,
    setFieldTouched,
    handleBlur,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setSubmitting,
    validateAll,
  }
}
