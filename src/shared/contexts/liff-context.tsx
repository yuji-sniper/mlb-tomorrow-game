"use client";

import { createContext, useContext, useEffect, useState } from "react";
import liff, { Liff } from "@line/liff";
import { useErrorHandlerContext } from "./error-handler-context";
import { ERROR_CODE } from "@/shared/constants/error";

type LiffContextType = {
  liff: Liff | null;
  logout: (redirectPath?: string) => void;
};

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const { handleError } = useErrorHandlerContext();

  /**
   * LIFF初期化
   */
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

      // ログインテスト用
      // liff.logout();

      if (!liff.isLoggedIn()) {
        liff.login({
          redirectUri: window.location.href,
        });
        return;
      }

      setLiffObject(liff);
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        'Failed to initialize LIFF',
        error,
      );
    }
  };

  /**
   * LIFF初期化実行
   */
  useEffect(() => {
    initializeLiff();
  }, []);

  const logout = (redirectPath?: string) => {
    if (!liffObject) {
      return;
    }
    liffObject.logout();
    window.location.href = redirectPath || '/';
  }

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        logout,
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
