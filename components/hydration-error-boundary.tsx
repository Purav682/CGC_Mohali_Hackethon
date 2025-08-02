"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a hydration error
    if (
      error.message.includes("hydration") ||
      error.message.includes("Hydration") ||
      error.message.includes("Text content did not match") ||
      error.message.includes("server rendered HTML didn't match") ||
      error.message.includes("server rendered text didn't match") ||
      error.message.includes("fdprocessedid")
    ) {
      console.warn("Hydration error caught by boundary:", error.message)
      return { hasError: true, error }
    }
    
    // Re-throw non-hydration errors
    throw error
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log hydration errors, don't crash the app
    if (
      error.message.includes("hydration") ||
      error.message.includes("Hydration") ||
      error.message.includes("Text content did not match") ||
      error.message.includes("server rendered HTML didn't match") ||
      error.message.includes("server rendered text didn't match") ||
      error.message.includes("fdprocessedid")
    ) {
      console.warn("Hydration error boundary caught:", error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI for hydration errors
      return this.props.fallback || this.props.children
    }

    return this.props.children
  }
}

// Hook to suppress hydration warnings during development
export function useSupressHydrationWarning() {
  React.useEffect(() => {
    const originalError = console.error
    
    console.error = (...args) => {
      if (
        typeof args[0] === "string" && (
          args[0].includes("Warning: Text content did not match") ||
          args[0].includes("Warning: Expected server HTML") ||
          args[0].includes("fdprocessedid") ||
          args[0].includes("server rendered text didn't match") ||
          args[0].includes("Hydration failed")
        )
      ) {
        return
      }
      originalError(...args)
    }

    return () => {
      console.error = originalError
    }
  }, [])
}
