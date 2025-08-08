"use client"

import { useEffect } from "react"
import { ErrorFallback } from "@/shared/components/errors/error-fallback"

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return <ErrorFallback />
}
