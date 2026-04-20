'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((event: Event) => void) | null
  onend: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

interface VoiceSearchProps {
  onSearch: (query: string) => void
  className?: string
}

// Voice commands mapping
const voiceCommands = {
  'show me black opals': { category: 'black-opal' },
  'show black opals': { category: 'black-opal' },
  'find rings': { category: 'rings' },
  'show rings': { category: 'rings' },
  'under five hundred': { priceRange: [0, 500] },
  'under one thousand': { priceRange: [0, 1000] },
  'from lightning ridge': { origin: 'Lightning Ridge' },
  'from coober pedy': { origin: 'Coober Pedy' },
  'new arrivals': { filter: 'new' },
  'best sellers': { sort: 'featured' },
  'cheapest first': { sort: 'price-low' },
  'most expensive': { sort: 'price-high' },
}

/**
 * Voice Search Component
 * Enables voice commands for searching and filtering products
 */
export function VoiceSearch({ onSearch, className }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true)
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()

        const recognition = recognitionRef.current
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'en-AU'

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setShowModal(true)
      }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex
          const transcript = event.results[current][0].transcript.toLowerCase()
          setTranscript(transcript)

          // If the result is final, process it
          if (event.results[current].isFinal) {
            handleVoiceCommand(transcript)
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(getErrorMessage(event.error))
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return "No speech detected. Please try again."
      case 'audio-capture':
        return "Microphone not found. Please check your device."
      case 'not-allowed':
        return "Microphone access denied. Please allow microphone access."
      default:
        return "An error occurred. Please try again."
    }
  }

  const handleVoiceCommand = (command: string) => {
    // Check for exact command matches
    for (const [phrase, action] of Object.entries(voiceCommands)) {
      if (command.includes(phrase)) {
        // Execute the appropriate action
        onSearch(phrase)
        setShowModal(false)
        return
      }
    }

    // If no command match, treat as search query
    onSearch(command)
    setShowModal(false)
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setShowModal(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <>
      {/* Voice Search Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={startListening}
        disabled={isListening}
        className={cn(
          "relative group",
          isListening && "bg-red-50 border-red-200",
          className
        )}
        aria-label="Voice search"
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MicOff className="w-4 h-4 text-red-600" />
          </motion.div>
        ) : (
          <Mic className="w-4 h-4 group-hover:text-opal-electric transition-colors" />
        )}
      </Button>

      {/* Voice Search Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => {
                  stopListening()
                  setShowModal(false)
                }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close voice search"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Animated mic icon */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                  {isListening ? (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-500"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="absolute inset-0 rounded-full bg-red-500 flex items-center justify-center">
                        <Mic className="w-12 h-12 text-white" />
                      </div>
                    </>
                  ) : error ? (
                    <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
                      <MicOff className="w-12 h-12 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <Loader2 className="w-12 h-12 text-gray-600 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Status text */}
                <h3 className="text-xl font-semibold mb-2">
                  {isListening ? 'Listening...' : error ? 'Error' : 'Getting ready...'}
                </h3>

                {/* Transcript or error */}
                {transcript ? (
                  <p className="text-lg text-gray-700 mb-6 min-h-[60px]">
                    "{transcript}"
                  </p>
                ) : error ? (
                  <p className="text-red-600 mb-6">{error}</p>
                ) : (
                  <p className="text-gray-500 mb-6">
                    Try saying "Show me black opals" or "Find rings under $500"
                  </p>
                )}

                {/* Example commands */}
                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Example commands:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="text-left">• "Show black opals"</div>
                    <div className="text-left">• "Find rings"</div>
                    <div className="text-left">• "Under $500"</div>
                    <div className="text-left">• "From Lightning Ridge"</div>
                  </div>
                </div>

                {/* Action buttons */}
                {isListening && (
                  <Button
                    onClick={stopListening}
                    className="mt-6"
                    variant="destructive"
                  >
                    Stop Listening
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}