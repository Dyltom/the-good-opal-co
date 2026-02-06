'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { usePersonalization } from '@/hooks/usePersonalization'
import { Sparkles, ChevronRight } from 'lucide-react'

/**
 * Personalized Hero Component
 * Dynamic hero section that adapts based on user preferences
 */
export function PersonalizedHero() {
  const [data, actions] = usePersonalization()
  const personalizedMessage = actions.getPersonalizedMessage()

  // Determine background gradient based on preferences
  const getBackgroundGradient = () => {
    if (data.quizResults?.color === 'dark') {
      return 'from-black-rich via-gray-900 to-black-rich'
    }
    if (data.quizResults?.color === 'fire') {
      return 'from-gray-900 via-fire-coral/20 to-black-rich'
    }
    return 'from-black-rich via-gray-900 to-black-rich'
  }

  // Get appropriate subtitle based on user data
  const getSubtitle = () => {
    if (data.quizResults?.occasion === 'investment') {
      return 'Explore our premium collection of investment-grade Australian opals'
    }
    if (data.quizResults?.style === 'modern') {
      return 'Contemporary designs meet ancient beauty in our curated selection'
    }
    if (data.viewedProducts.length > 10) {
      return 'Welcome back! Continue exploring where you left off'
    }
    return 'Handpicked treasures from Lightning Ridge, Coober Pedy, and Queensland'
  }

  return (
    <section className={`relative py-20 md:py-28 bg-gradient-to-b ${getBackgroundGradient()} overflow-hidden`}>
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-40 left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, var(--fire-gold) 0%, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: 'radial-gradient(circle, var(--opal-electric) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)`
        }} />
      </div>

      <Container>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Welcome back badge for returning users */}
          {data.viewedProducts.length > 5 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-block"
            >
              <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-sm text-white/80 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Welcome back, opal enthusiast!
                </span>
              </div>
            </motion.div>
          )}

          {/* Main headline with personalization */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.21, 1.02, 0.73, 1] }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 text-white leading-tight"
          >
            {personalizedMessage}
          </motion.h1>

          {/* Dynamic subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 1.02, 0.73, 1] }}
            className="text-xl md:text-2xl text-white/80 font-light max-w-3xl mx-auto mb-12"
          >
            {getSubtitle()}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 1.02, 0.73, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {data.quizResults ? (
              <Button
                size="lg"
                className="bg-gradient-to-r from-opal-electric to-opal-deep hover:from-opal-electric-accessible hover:to-opal-deep text-white group"
                asChild
              >
                <a href="#recommendations">
                  View Your Recommendations
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-gradient-to-r from-opal-electric to-opal-deep hover:from-opal-electric-accessible hover:to-opal-deep text-white group"
                asChild
              >
                <a href="#quiz">
                  Find Your Perfect Opal
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              asChild
            >
              <a href="#all-products">Browse Collection</a>
            </Button>
          </motion.div>

          {/* Dynamic stats based on user preferences */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center gap-8 mt-12"
          >
            {data.quizResults?.budget === 'luxury' ? (
              <>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">Premium</p>
                  <p className="text-sm text-white/60 mt-1">Collection</p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">Expert</p>
                  <p className="text-sm text-white/60 mt-1">Curation</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">300+</p>
                  <p className="text-sm text-white/60 mt-1">Unique Pieces</p>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">Free</p>
                  <p className="text-sm text-white/60 mt-1">Shipping $500+</p>
                </div>
              </>
            )}
            <div className="h-12 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-white/60 mt-1">Australian</p>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}