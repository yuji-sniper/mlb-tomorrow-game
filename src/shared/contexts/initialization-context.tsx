"use client";

import { createContext, useContext, useState } from "react";
import { FullScreenSpinner } from "../components/ui/spinner/full-screen-spinner/full-screen-spinner";

type InitializationContextType = {
  isInitialized: boolean;
  setIsInitialized: (isInitialized: boolean) => void;
}

const InitializationContext = createContext<InitializationContextType | undefined>(undefined);

export const InitializationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  return (
    <InitializationContext.Provider
      value={{
        isInitialized,
        setIsInitialized,
      }}
    >
      {children}
    </InitializationContext.Provider>
  );
};

export const useInitialization = () => {
  const context = useContext(InitializationContext);

  if (!context) {
    throw new Error('useInitialization must be used within a InitializationProvider');
  }

  return context;
};

export function LoadingUntilInitialized({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInitialized } = useInitialization();

  if (!isInitialized) {
    return <FullScreenSpinner/>;
  }

  return children;
}
