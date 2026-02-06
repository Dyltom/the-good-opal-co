'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProductFinderCalloutProps {
  onStartQuiz: () => void
  className?: string
}

/**
 * Product Finder Quiz Callout
 * Engaging CTA to start the product finder quiz
 */
export function ProductFinderCallout({ onStartQuiz, className }: ProductFinderCalloutProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 border-opal-electric/20",
        "bg-gradient-to-br from-opal-electric/5 to-opal-deep/5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundImage: [
            'radial-gradient(circle at 0% 0%, var(--opal-electric) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, var(--opal-deep) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, var(--opal-electric) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Icon and content */}
          <div className="flex-shrink-0">
            <motion.div
              animate={{
                rotate: isHovered ? 360 : 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut"
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-fire-gold to-fire-orange flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              Find Your Perfect Opal
            </h3>
            <p className="text-muted-foreground mb-4 md:mb-0 max-w-md">
              Take our quick quiz and discover opals matched to your style, occasion, and budget in under 60 seconds.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Button
              size="lg"
              onClick={onStartQuiz}
              className="bg-gradient-to-r from-opal-electric to-opal-deep hover:from-opal-electric-accessible hover:to-opal-deep text-white group"
            >
              Start Quiz
              <motion.span
                animate={{
                  x: isHovered ? 5 : 0,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">2 min</span>
            <span>to complete</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">90%</span>
            <span>find their perfect match</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">AI-powered</span>
            <span>recommendations</span>
          </div>
        </div>
      </div>
    </Card>
  )
}