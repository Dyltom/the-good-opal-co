'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { ChevronRight, ChevronLeft, Gift, Calendar, DollarSign, Palette, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/app/(marketing)/store/page'

interface QuizQuestion {
  id: string
  question: string
  icon: React.ReactNode
  options: QuizOption[]
}

interface QuizOption {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  filters: {
    categories?: string[]
    priceRange?: [number, number]
    stoneTypes?: string[]
    tags?: string[]
  }
}

interface ProductFinderQuizProps {
  onComplete: (filters: QuizFilters) => void
  onSkip: () => void
  products: Product[]
}

interface QuizFilters {
  categories: string[]
  priceRange?: [number, number]
  stoneTypes: string[]
  tags: string[]
}

const questions: QuizQuestion[] = [
  {
    id: 'occasion',
    question: 'What\'s the occasion for this opal?',
    icon: <Gift className="w-6 h-6" />,
    options: [
      {
        id: 'everyday',
        label: 'Everyday Wear',
        description: 'Versatile pieces for daily elegance',
        icon: <Calendar className="w-5 h-5" />,
        filters: {
          categories: ['rings', 'necklaces', 'earrings'],
          tags: ['versatile', 'daily-wear']
        }
      },
      {
        id: 'special',
        label: 'Special Occasion',
        description: 'Statement pieces for memorable moments',
        icon: <Sparkles className="w-5 h-5" />,
        filters: {
          categories: ['necklaces', 'rings', 'bracelets'],
          tags: ['statement', 'luxury']
        }
      },
      {
        id: 'investment',
        label: 'Investment Piece',
        description: 'Premium opals with lasting value',
        icon: <DollarSign className="w-5 h-5" />,
        filters: {
          categories: ['raw-opals', 'rings', 'necklaces'],
          priceRange: [1000, 10000],
          tags: ['investment', 'premium']
        }
      }
    ]
  },
  {
    id: 'style',
    question: 'Which style speaks to you?',
    icon: <Palette className="w-6 h-6" />,
    options: [
      {
        id: 'classic',
        label: 'Classic Elegance',
        description: 'Timeless designs that never go out of style',
        filters: {
          categories: ['rings', 'necklaces'],
          tags: ['classic', 'timeless']
        }
      },
      {
        id: 'modern',
        label: 'Modern Minimalist',
        description: 'Clean lines and contemporary aesthetics',
        filters: {
          categories: ['earrings', 'rings'],
          tags: ['modern', 'minimalist']
        }
      },
      {
        id: 'statement',
        label: 'Bold Statement',
        description: 'Eye-catching pieces that command attention',
        filters: {
          categories: ['necklaces', 'rings'],
          stoneTypes: ['Black Opal', 'Boulder Opal'],
          tags: ['statement', 'bold']
        }
      }
    ]
  },
  {
    id: 'budget',
    question: 'What\'s your budget range?',
    icon: <DollarSign className="w-6 h-6" />,
    options: [
      {
        id: 'entry',
        label: 'Under $500',
        description: 'Beautiful opals at accessible prices',
        filters: {
          priceRange: [0, 500]
        }
      },
      {
        id: 'mid',
        label: '$500 - $1500',
        description: 'Premium quality and craftsmanship',
        filters: {
          priceRange: [500, 1500]
        }
      },
      {
        id: 'luxury',
        label: '$1500+',
        description: 'Exceptional opals for discerning collectors',
        filters: {
          priceRange: [1500, 10000]
        }
      }
    ]
  },
  {
    id: 'color',
    question: 'Which opal colors captivate you?',
    icon: <Palette className="w-6 h-6" />,
    options: [
      {
        id: 'dark',
        label: 'Dark & Mysterious',
        description: 'Black and dark boulder opals',
        filters: {
          stoneTypes: ['Black Opal', 'Boulder Opal']
        }
      },
      {
        id: 'bright',
        label: 'Bright & Vibrant',
        description: 'Crystal and white opals with brilliant play',
        filters: {
          stoneTypes: ['Crystal Opal', 'White Opal']
        }
      },
      {
        id: 'fire',
        label: 'Warm Fire Tones',
        description: 'Fire opals with red and orange hues',
        filters: {
          stoneTypes: ['Fire Opal', 'Matrix Opal']
        }
      }
    ]
  }
]

/**
 * AI-Powered Product Finder Quiz
 * Interactive quiz to help customers find their perfect opal
 */
export function ProductFinderQuiz({ onComplete, onSkip, products: _products }: ProductFinderQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId })

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    } else {
      // Quiz complete, process results
      setTimeout(() => {
        processResults()
      }, 300)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const processResults = () => {
    setShowResults(true)

    // Combine all selected filters
    const combinedFilters: QuizFilters = {
      categories: [],
      stoneTypes: [],
      tags: []
    }

    Object.entries(answers).forEach(([questionId, optionId]) => {
      const question = questions.find(q => q.id === questionId)
      const option = question?.options.find(o => o.id === optionId)

      if (option?.filters) {
        if (option.filters.categories) {
          combinedFilters.categories.push(...option.filters.categories)
        }
        if (option.filters.stoneTypes) {
          combinedFilters.stoneTypes.push(...option.filters.stoneTypes)
        }
        if (option.filters.tags) {
          combinedFilters.tags.push(...option.filters.tags)
        }
        if (option.filters.priceRange) {
          combinedFilters.priceRange = option.filters.priceRange
        }
      }
    })

    // Remove duplicates
    combinedFilters.categories = [...new Set(combinedFilters.categories)]
    combinedFilters.stoneTypes = [...new Set(combinedFilters.stoneTypes)]
    combinedFilters.tags = [...new Set(combinedFilters.tags)]

    // Wait for animation then complete
    setTimeout(() => {
      onComplete(combinedFilters)
    }, 1500)
  }

  const question = questions[currentQuestion]
  if (!question) return null

  return (
    <Card className="max-w-2xl mx-auto border-2 border-opal-electric/20">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className={cn(
              "transition-opacity",
              currentQuestion === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
          >
            Skip
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
          <motion.div
            className="bg-gradient-to-r from-opal-electric to-opal-deep h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-opal-electric/10">
                  {question.icon}
                </div>
              </div>
              <CardTitle className="text-2xl font-serif">
                {question.question}
              </CardTitle>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="py-4"
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-opal-electric/10">
                  <Sparkles className="w-8 h-8 text-opal-electric" />
                </div>
              </div>
              <CardTitle className="text-2xl font-serif mb-2">
                Finding Your Perfect Opal...
              </CardTitle>
              <p className="text-muted-foreground">
                Based on your preferences, we&apos;re curating a personalized selection
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="pb-8">
        <AnimatePresence mode="wait">
          {!showResults && (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4"
            >
              {question.options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AnimatedButton
                    variant="outline"
                    size="lg"
                    onClick={() => handleAnswer(question.id, option.id)}
                    className={cn(
                      "w-full p-6 h-auto justify-start text-left",
                      "hover:border-opal-electric hover:bg-opal-electric/5",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="flex items-start gap-4 w-full">
                      {option.icon && (
                        <div className="p-2 rounded-lg bg-gray-100">
                          {option.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1">
                          {option.label}
                        </h4>
                        {option.description && (
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </AnimatedButton>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}