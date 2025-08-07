import { LiffProvider } from "@/shared/contexts/liff-context";
import { Suspense } from "react";
import { FullScreenSpinner } from "@/shared/components/ui/spinner/full-screen-spinner/full-screen-spinner";
import { Metadata } from "next";
import { ErrorHandlerProvider } from "@/shared/contexts/error-handler-context";
import LiffLayout from "@/shared/components/layouts/liff-layout";
import { SnackbarProvider } from "@/shared/contexts/snackbar-context";
import { InitializationProvider } from "@/shared/contexts/initialization-context";

export const metadata: Metadata = {
  title: "MLB 明日の試合",
  description: "MLB 明日の試合",
};

export default function LiffRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorHandlerProvider>
      <InitializationProvider>
        <LiffProvider>
          <SnackbarProvider>
            <Suspense fallback={<FullScreenSpinner/>}>
              <LiffLayout>
                {children}
              </LiffLayout>
            </Suspense>
          </SnackbarProvider>
        </LiffProvider>
      </InitializationProvider>
    </ErrorHandlerProvider>
  );
} 
