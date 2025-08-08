import type { Metadata } from "next"
import { Suspense } from "react"
import LiffLayout from "@/shared/components/layouts/liff-layout"
import { FullScreenSpinner } from "@/shared/components/ui/spinner/full-screen-spinner/full-screen-spinner"
import { ErrorHandlerProvider } from "@/shared/contexts/error-handler-context"
import { InitializationProvider } from "@/shared/contexts/initialization-context"
import { LiffProvider } from "@/shared/contexts/liff-context"
import { SnackbarProvider } from "@/shared/contexts/snackbar-context"

export const metadata: Metadata = {
  title: "MLB 明日の試合",
  description: "MLB 明日の試合",
}

export default function LiffRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorHandlerProvider>
      <InitializationProvider>
        <LiffProvider>
          <SnackbarProvider>
            <Suspense fallback={<FullScreenSpinner />}>
              <LiffLayout>{children}</LiffLayout>
            </Suspense>
          </SnackbarProvider>
        </LiffProvider>
      </InitializationProvider>
    </ErrorHandlerProvider>
  )
}
