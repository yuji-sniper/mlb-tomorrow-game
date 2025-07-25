import { LiffProvider } from "@/contexts/liff-context";

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiffProvider>
      {children}
    </LiffProvider>
  );
} 
