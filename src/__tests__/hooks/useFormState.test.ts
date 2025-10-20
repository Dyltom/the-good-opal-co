import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormState } from '@/hooks/useFormState'

describe('useFormState', () => {
  describe('Initialization', () => {
    it('should initialize with provided initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const { result } = renderHook(() => useFormState(initialValues))

      expect(result.current.values).toEqual(initialValues)
    })

    it('should initialize with empty object if no initial values provided', () => {
      const { result } = renderHook(() => useFormState())

      expect(result.current.values).toEqual({})
    })

    it('should start with idle status', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      expect(result.current.status).toBe('idle')
    })

    it('should start with no errors', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      expect(result.current.errors).toEqual({})
    })

    it('should not be submitting initially', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      expect(result.current.isSubmitting).toBe(false)
    })

    it('should not be pristine after initialization', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('setValue', () => {
    it('should update a single field value', () => {
      const { result } = renderHook(() => useFormState({ name: '', email: '' }))

      act(() => {
        result.current.setValue('name', 'Jane')
      })

      expect(result.current.values.name).toBe('Jane')
      expect(result.current.values.email).toBe('')
    })

    it('should mark form as dirty after setting value', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setValue('name', 'Jane')
      })

      expect(result.current.isDirty).toBe(true)
    })

    it('should handle multiple field updates', () => {
      const { result } = renderHook(() => useFormState({ name: '', email: '', phone: '' }))

      act(() => {
        result.current.setValue('name', 'Jane')
        result.current.setValue('email', 'jane@example.com')
        result.current.setValue('phone', '555-0123')
      })

      expect(result.current.values).toEqual({
        name: 'Jane',
        email: 'jane@example.com',
        phone: '555-0123',
      })
    })

    it('should accept typed field names', () => {
      type FormData = { name: string; age: number }
      const { result } = renderHook(() => useFormState<FormData>({ name: '', age: 0 }))

      act(() => {
        result.current.setValue('name', 'Jane')
        result.current.setValue('age', 30)
      })

      expect(result.current.values.name).toBe('Jane')
      expect(result.current.values.age).toBe(30)
    })
  })

  describe('setValues', () => {
    it('should update multiple fields at once', () => {
      const { result } = renderHook(() => useFormState({ name: '', email: '', phone: '' }))

      act(() => {
        result.current.setValues({ name: 'Jane', email: 'jane@example.com' })
      })

      expect(result.current.values.name).toBe('Jane')
      expect(result.current.values.email).toBe('jane@example.com')
      expect(result.current.values.phone).toBe('')
    })

    it('should mark form as dirty', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setValues({ name: 'Jane' })
      })

      expect(result.current.isDirty).toBe(true)
    })
  })

  describe('setError', () => {
    it('should set error for a field', () => {
      const { result } = renderHook(() => useFormState({ email: '' }))

      act(() => {
        result.current.setError('email', 'Invalid email address')
      })

      expect(result.current.errors.email).toBe('Invalid email address')
    })

    it('should handle multiple errors', () => {
      const { result } = renderHook(() => useFormState({ name: '', email: '' }))

      act(() => {
        result.current.setError('name', 'Name is required')
        result.current.setError('email', 'Email is required')
      })

      expect(result.current.errors).toEqual({
        name: 'Name is required',
        email: 'Email is required',
      })
    })

    it('should clear error when set to undefined', () => {
      const { result } = renderHook(() => useFormState({ email: '' }))

      act(() => {
        result.current.setError('email', 'Invalid email')
      })

      act(() => {
        result.current.setError('email', undefined)
      })

      expect(result.current.errors.email).toBeUndefined()
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormState({ name: '', email: '' }))

      act(() => {
        result.current.setError('name', 'Name error')
        result.current.setError('email', 'Email error')
      })

      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
    })

    it('should work when no errors exist', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
    })
  })

  describe('reset', () => {
    it('should reset values to initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const { result } = renderHook(() => useFormState(initialValues))

      act(() => {
        result.current.setValue('name', 'Jane')
        result.current.setValue('email', 'jane@example.com')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.values).toEqual(initialValues)
    })

    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setError('name', 'Error')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.errors).toEqual({})
    })

    it('should reset status to idle', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setStatus('success')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
    })

    it('should mark form as not dirty', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setValue('name', 'Jane')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('setStatus', () => {
    it('should update status to loading', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setStatus('loading')
      })

      expect(result.current.status).toBe('loading')
      expect(result.current.isSubmitting).toBe(true)
    })

    it('should update status to success', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setStatus('success')
      })

      expect(result.current.status).toBe('success')
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should update status to error', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setStatus('error')
      })

      expect(result.current.status).toBe('error')
      expect(result.current.isSubmitting).toBe(false)
    })

    it('should handle status transitions', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      act(() => {
        result.current.setStatus('loading')
      })
      expect(result.current.status).toBe('loading')

      act(() => {
        result.current.setStatus('success')
      })
      expect(result.current.status).toBe('success')

      act(() => {
        result.current.setStatus('idle')
      })
      expect(result.current.status).toBe('idle')
    })
  })

  describe('Computed Properties', () => {
    it('should compute isSubmitting correctly', () => {
      const { result } = renderHook(() => useFormState({ name: '' }))

      expect(result.current.isSubmitting).toBe(false)

      act(() => {
        result.current.setStatus('loading')
      })

      expect(result.current.isSubmitting).toBe(true)

      act(() => {
        result.current.setStatus('success')
      })

      expect(result.current.isSubmitting).toBe(false)
    })

    it('should track isDirty state', () => {
      const { result } = renderHook(() => useFormState({ name: 'John' }))

      expect(result.current.isDirty).toBe(false)

      act(() => {
        result.current.setValue('name', 'Jane')
      })

      expect(result.current.isDirty).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('TypeScript Types', () => {
    it('should enforce field name types', () => {
      type FormData = { name: string; email: string; age: number }
      const { result } = renderHook(() =>
        useFormState<FormData>({ name: '', email: '', age: 0 })
      )

      // These should work fine
      act(() => {
        result.current.setValue('name', 'Jane')
        result.current.setValue('email', 'jane@example.com')
        result.current.setValue('age', 30)
      })

      expect(result.current.values.name).toBe('Jane')
      expect(result.current.values.email).toBe('jane@example.com')
      expect(result.current.values.age).toBe(30)
    })
  })
})
