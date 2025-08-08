"use client"

import { createContext, useContext, useState } from "react"
import Snackbar from "@/shared/components/ui/snackbar/snackbar"

type SnackbarStatus = "success" | "error"

type ShowSnackbar = (message: string) => void

type SnackbarContextType = {
  showSuccessSnackbar: ShowSnackbar
  showErrorSnackbar: ShowSnackbar
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
)

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<SnackbarStatus>("success")

  const showSnackbar = (message: string, status: SnackbarStatus) => {
    setOpen(true)
    setMessage(message)
    setStatus(status)
  }

  const showSuccessSnackbar = (message: string) => {
    showSnackbar(message, "success")
  }

  const showErrorSnackbar = (message: string) => {
    showSnackbar(message, "error")
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <SnackbarContext.Provider
      value={{
        showSuccessSnackbar,
        showErrorSnackbar,
      }}
    >
      {children}
      <Snackbar
        open={open}
        onClose={handleClose}
        message={message}
        status={status}
      />
    </SnackbarContext.Provider>
  )
}

export function useSnackbarContext() {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error("useSnackbarContext must be used within a SnackbarProvider")
  }
  return context
}
