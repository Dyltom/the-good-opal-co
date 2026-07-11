'use client'

import Image from 'next/image'
import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ViewerErrorBoundaryProps {
  children: ReactNode
}

interface ViewerErrorBoundaryState {
  failed: boolean
}

export class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  ViewerErrorBoundaryState
> {
  override state: ViewerErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Custom ring viewer failed:', error, info.componentStack)
  }

  override render() {
    if (this.state.failed) {
      return (
        <div className="relative aspect-[4/5] min-h-[28rem] overflow-hidden bg-black-rich text-cream sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-0">
          <Image
            src="/images/customs/custom-2.jpg"
            alt="Australian opals used as inspiration for a custom jewellery design"
            fill
            priority
            className="object-cover opacity-65"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          <div className="absolute inset-0 bg-black-rich/40" />
          <p className="absolute inset-x-6 bottom-8 max-w-md text-sm leading-6 text-cream/90">
            The interactive preview could not load. Your design controls and consultation request
            still work.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
