import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCart, CartProvider } from '@/contexts/CartContext'
import { createElement, type ReactNode } from 'react'

// Wrapper component for tests
function wrapper({ children }: { children: ReactNode }) {
  return createElement(CartProvider, null, children)
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useCart', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('Initialization', () => {
    it('should start with empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      expect(result.current.items).toEqual([])
      expect(result.current.itemCount).toBe(0)
      expect(result.current.total).toBe(0)
    })

    it('should load cart from localStorage if exists', () => {
      localStorageMock.setItem(
        'cart',
        JSON.stringify([{ id: '1', name: 'Test Product', price: 10, quantity: 2 }])
      )

      const { result } = renderHook(() => useCart(), { wrapper })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.itemCount).toBe(2)
    })
  })

  describe('addItem', () => {
    it('should add item to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test-product',
          name: 'Test Product',
          price: 10,
          quantity: 1,
        })
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]?.name).toBe('Test Product')
      expect(result.current.itemCount).toBe(1)
    })

    it('should increment quantity if item already in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 1,
        })
      })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 1,
        })
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]?.quantity).toBe(2)
      expect(result.current.itemCount).toBe(2)
    })

    it('should save to localStorage', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 1,
        })
      })

      const saved = localStorageMock.getItem('cart')
      expect(saved).toBeTruthy()
      expect(JSON.parse(saved!)).toHaveLength(1)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 1,
        })
      })

      act(() => {
        result.current.removeItem('1')
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.itemCount).toBe(0)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 1,
        })
      })

      act(() => {
        result.current.updateQuantity('1', 5)
      })

      expect(result.current.items[0]?.quantity).toBe(5)
      expect(result.current.itemCount).toBe(5)
    })

    it('should remove item if quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 1,
        })
      })

      act(() => {
        result.current.updateQuantity('1', 0)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('should remove all items', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test1',
          name: 'Test 1',
          price: 10,
          quantity: 1,
        })
        result.current.addItem({
          id: '2',
          slug: 'test2',
          name: 'Test 2',
          price: 20,
          quantity: 1,
        })
      })

      act(() => {
        result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.itemCount).toBe(0)
      expect(result.current.total).toBe(0)
    })
  })

  describe('Calculated Values', () => {
    it('should calculate total correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 2,
        })
        result.current.addItem({
          id: '2',
          slug: 'test2',
          name: 'Test 2',
          price: 15,
          quantity: 1,
        })
      })

      // (10 * 2) + (15 * 1) = 35
      expect(result.current.total).toBe(35)
    })

    it('should calculate itemCount correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper })

      act(() => {
        result.current.addItem({
          id: '1',
          slug: 'test',
          name: 'Test',
          price: 10,
          quantity: 3,
        })
        result.current.addItem({
          id: '2',
          slug: 'test2',
          name: 'Test 2',
          price: 15,
          quantity: 2,
        })
      })

      expect(result.current.itemCount).toBe(5) // 3 + 2
    })
  })
})
