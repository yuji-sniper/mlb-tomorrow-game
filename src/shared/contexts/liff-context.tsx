"use client"

import liff, { type Liff } from "@line/liff"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { ERROR_CODE } from "@/shared/constants/error"
import { useErrorHandlerContext } from "./error-handler-context"

type LiffContextType = {
  liff: Liff | null
  relogin: (redirectUri?: string) => void
}

const LiffContext = createContext<LiffContextType | undefined>(undefined)

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null)
  const { handleError } = useErrorHandlerContext()

  /**
   * LIFF初期化
   */
  const initializeLiff = useCallback(async () => {
    if (liffObject) {
      return
    }

    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID
      if (!liffId) {
        throw new Error("LIFF ID is not found")
      }

      await liff.init({ liffId })

      if (!liff.isLoggedIn()) {
        liff.login({
          redirectUri: window.location.href,
        })
        return
      }

      setLiffObject(liff)
    } catch (error) {
      handleError(ERROR_CODE.ERROR, "Failed to initialize LIFF", error)
    }
  }, [liffObject, handleError])

  /**
   * LIFF初期化実行
   */
  useEffect(() => {
    initializeLiff()
  }, [initializeLiff])

  /**
   * 再ログイン
   */
  const relogin = (redirectUri?: string) => {
    if (!liffObject) {
      return
    }

    liffObject.logout()

    liffObject.login({
      redirectUri: redirectUri || window.location.href,
    })
  }

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        relogin,
      }}
    >
      {children}
    </LiffContext.Provider>
  )
}

export function useLiffContext() {
  const context = useContext(LiffContext)
  if (context === undefined) {
    throw new Error("useLiffContext must be used within a LiffProvider")
  }
  return context
}
