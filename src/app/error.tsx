"use client";

import { ErrorFallback } from "@/shared/components/errors/error-fallback";
import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorFallback/>
  )
}
