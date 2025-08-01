"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ClientOnlyContextType = {
  mounted: boolean;
};

const ClientOnlyContext = createContext<ClientOnlyContextType | undefined>(undefined);

export function ClientOnlyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ClientOnlyContext.Provider value={{ mounted }}>
      {children}
    </ClientOnlyContext.Provider>
  );
}

export function useClientOnly() {
  const context = useContext(ClientOnlyContext);

  if (!context) {
    throw new Error("useClientOnly must be used within a ClientOnlyProvider");
  }

  return context;
}

export function ClientOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const { mounted } = useClientOnly();

  if (!mounted) {
    return <>{fallback}</>;
  }

  return children;
}
