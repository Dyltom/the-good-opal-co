'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Product } from '@/app/(marketing)/store/page'

interface PersonalizationData {
  viewedProducts: string[]
  searchHistory: string[]
  categoryPreferences: Record<string, number>
  pricePreferences: { min: number; max: number; average: number }
  stylePreferences: string[]
  lastVisit: string
  quizResults?: {
    occasion?: string
    style?: string
    budget?: string
    color?: string
  }
}

interface PersonalizationActions {
  trackProductView: (productId: string, category?: string, price?: number) => void
  trackSearch: (query: string) => void
  trackCategoryView: (category: string) => void
  saveQuizResults: (results: PersonalizationData['quizResults']) => void
  getRecommendations: (products: Product[]) => Product[]
  getPersonalizedMessage: () => string
  clearData: () => void
}

const defaultData: PersonalizationData = {
  viewedProducts: [],
  searchHistory: [],
  categoryPreferences: {},
  pricePreferences: { min: 0, max: 0, average: 0 },
  stylePreferences: [],
  lastVisit: new Date().toISOString(),
}

/**
 * Personalization Hook
 * Tracks user behavior and provides personalized recommendations
 */
export function usePersonalization(): [PersonalizationData, PersonalizationActions] {
  const [data, setData] = useLocalStorage<PersonalizationData>('opal-personalization', defaultData)

  // Track product view
  const trackProductView = useCallback((productId: string, category?: string, price?: number) => {
    setData((prev) => {
      const viewed = [productId, ...prev.viewedProducts.filter(id => id !== productId)].slice(0, 20)

      // Update category preferences
      const categoryPrefs = { ...prev.categoryPreferences }
      if (category) {
        categoryPrefs[category] = (categoryPrefs[category] || 0) + 1
      }

      // Update price preferences
      let pricePrefs = { ...prev.pricePreferences }
      if (price) {
        const allPrices = [...viewed.map(() => price), prev.pricePreferences.average * viewed.length]
        const min = Math.min(price, prev.pricePreferences.min || price)
        const max = Math.max(price, prev.pricePreferences.max || price)
        const average = allPrices.reduce((a, b) => a + b, 0) / allPrices.length

        pricePrefs = { min, max, average }
      }

      return {
        ...prev,
        viewedProducts: viewed,
        categoryPreferences: categoryPrefs,
        pricePreferences: pricePrefs,
      }
    })
  }, [setData])

  // Track search query
  const trackSearch = useCallback((query: string) => {
    setData((prev) => ({
      ...prev,
      searchHistory: [query, ...prev.searchHistory.filter(q => q !== query)].slice(0, 10),
    }))
  }, [setData])

  // Track category view
  const trackCategoryView = useCallback((category: string) => {
    setData((prev) => ({
      ...prev,
      categoryPreferences: {
        ...prev.categoryPreferences,
        [category]: (prev.categoryPreferences[category] || 0) + 1,
      },
    }))
  }, [setData])

  // Save quiz results
  const saveQuizResults = useCallback((results: PersonalizationData['quizResults']) => {
    setData((prev) => ({
      ...prev,
      quizResults: results,
    }))
  }, [setData])

  // Get personalized recommendations
  const getRecommendations = useCallback((products: Product[]): Product[] => {
    if (!data.viewedProducts.length && !data.quizResults) {
      // No personalization data, return featured products
      return products.filter(p => p.featured).slice(0, 8)
    }

    // Score products based on personalization data
    const scoredProducts = products.map(product => {
      let score = 0

      // Category preference score
      if (product.category && data.categoryPreferences[product.category]) {
        score += data.categoryPreferences[product.category] * 10
      }

      // Price range score
      const avgPrice = data.pricePreferences.average
      if (avgPrice > 0) {
        const priceDiff = Math.abs(product.price - avgPrice)
        const priceScore = Math.max(0, 100 - (priceDiff / avgPrice) * 100)
        score += priceScore * 0.5
      }

      // Quiz results score
      if (data.quizResults) {
        if (data.quizResults.style === 'statement' && product.featured) {
          score += 20
        }
        if (data.quizResults.color === 'dark' && product.stoneType?.includes('Black')) {
          score += 15
        }
      }

      // Exclude already viewed products
      if (data.viewedProducts.includes(product.id)) {
        score *= 0.3 // Reduce score but don't eliminate
      }

      // Boost new products
      const isNew = product.createdAt &&
        new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      if (isNew) {
        score += 10
      }

      return { product, score }
    })

    // Sort by score and return top recommendations
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 12)
  }, [data])

  // Get personalized hero message
  const getPersonalizedMessage = useCallback((): string => {
    const hour = new Date().getHours()
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

    if (data.quizResults?.style) {
      const styleMessages = {
        classic: `${timeGreeting}! Discover timeless opals that never go out of style`,
        modern: `${timeGreeting}! Find contemporary opals for the modern collector`,
        statement: `${timeGreeting}! Make a statement with our bold opal collection`,
      }
      return styleMessages[data.quizResults.style as keyof typeof styleMessages] || `${timeGreeting}! Welcome back`
    }

    if (data.viewedProducts.length > 5) {
      return `${timeGreeting}! Continue exploring our curated collection`
    }

    return 'Discover the Magic of Australian Opals'
  }, [data])

  // Clear personalization data
  const clearData = useCallback(() => {
    setData(defaultData)
  }, [setData])

  return [
    data,
    {
      trackProductView,
      trackSearch,
      trackCategoryView,
      saveQuizResults,
      getRecommendations,
      getPersonalizedMessage,
      clearData,
    },
  ]
}

/**
 * Hook to get personalized product recommendations
 */
export function useRecommendations(products: Product[], limit = 8) {
  const [data, actions] = usePersonalization()
  const [recommendations, setRecommendations] = useState<Product[]>([])

  useEffect(() => {
    const recs = actions.getRecommendations(products).slice(0, limit)
    setRecommendations(recs)
  }, [products, limit, actions, data])

  return recommendations
}