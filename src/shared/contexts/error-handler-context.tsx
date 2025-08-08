"use client"

import { createContext, useContext, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ERROR_CODE } from "@/shared/constants/error"
import { ErrorFallback } from "../components/errors/error-fallback"
import { NotFoundFallback } from "../components/errors/not-found-fallback"

type HandleError = (
  code: keyof typeof ERROR_CODE,
  defaultMessage: string,
  error: unknown,
) => void

type ErrorHandlerContextType = {
  handleError: HandleError
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | undefined>(
  undefined,
)

export function ErrorHandlerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [code, setCode] = useState<keyof typeof ERROR_CODE | null>(null)
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    throw error
  }

  const handleError: HandleError = (code, defaultMessage, error) => {
    setCode(code)

    console.error(error)

    if (error instanceof Error) {
      setError(error)
    } else {
      setError(new Error(defaultMessage))
    }
  }

  const fallbackComponent =
    code === ERROR_CODE.NOT_FOUND ? NotFoundFallback : ErrorFallback

  return (
    <ErrorHandlerContext.Provider
      value={{
        handleError,
      }}
    >
      <ErrorBoundary FallbackComponent={fallbackComponent}>
        {children}
      </ErrorBoundary>
    </ErrorHandlerContext.Provider>
  )
}

export function useErrorHandlerContext() {
  const context = useContext(ErrorHandlerContext)
  if (context === undefined) {
    throw new Error(
      "useErrorHandlerContext must be used within a ErrorHandlerProvider",
    )
  }
  return context
}
