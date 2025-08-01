import { ClientOnly, ClientOnlyProvider } from "@/shared/contexts/client-only-context";
import { LiffProvider } from "@/shared/contexts/liff-context";

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnlyProvider>
      <LiffProvider>
        <ClientOnly>
          {children}
        </ClientOnly>
      </LiffProvider>
    </ClientOnlyProvider>
  );
} 
