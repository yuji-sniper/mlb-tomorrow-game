import { ClientOnly, ClientOnlyProvider } from "@/shared/contexts/client-only-context";
import { LiffProvider } from "@/shared/contexts/liff-context";
import { Suspense } from "react";
import { FullScreenSpinner } from "@/shared/components/ui/spinner/full-screen-spinner";

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnlyProvider>
      <LiffProvider>
        <ClientOnly>
          <Suspense fallback={<FullScreenSpinner/>}>
            {children}
          </Suspense>
        </ClientOnly>
      </LiffProvider>
    </ClientOnlyProvider>
  );
} 
