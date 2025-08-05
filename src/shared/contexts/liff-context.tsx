"use client";

import { createContext, useContext, useEffect, useState } from "react";
import liff, { Liff } from "@line/liff";
import { useErrorHandlerContext } from "./error-handler-context";
import { ERROR_CODE } from "@/shared/constants/error";

type LiffContextType = {
  liff: Liff | null;
  getLineIdToken: () => Promise<string | null>;
};

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const { handleError } = useErrorHandlerContext();

  const initializeLiff = async () => {
    if (liffObject) {
      return;
    }

    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) {
        throw new Error('LIFF ID is not found');
      }

      await liff.init({liffId});

      // liff.logout();
      setLiffObject(liff);
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        'Failed to initialize LIFF',
        error,
      );
    }
  };

  useEffect(() => {
    initializeLiff();
  }, []);

  const getLineIdToken = async (): Promise<string | null> => {
    if (!liffObject) {
      return null;
    }

    try {
      if (!liffObject.isLoggedIn()) {
        liffObject.login({
          redirectUri: window.location.href,
        });
        return null;
      }

      return liffObject.getIDToken();
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        'Failed to get LINE ID token',
        error,
      );
      return null;
    }
  };

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        getLineIdToken,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export function useLiffContext() {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error("useLiffContext must be used within a LiffProvider");
  }
  return context;
} 
