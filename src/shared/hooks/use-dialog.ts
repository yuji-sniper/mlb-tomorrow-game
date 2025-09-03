import { useState } from "react"

type UseDialog = () => {
  isOpen: boolean
  isLoading: boolean
  isCloseDisabled: boolean
  isSubmitDisabled: boolean
  open: (fn?: () => Promise<void>) => Promise<void>
  close: (fn?: () => void) => void
  submit: (fn?: () => Promise<void>) => Promise<void>
}

export const useDialog: UseDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCloseDisabled, setIsCloseDisabled] = useState(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)

  /**
   * ダイアログを開く
   */
  const open = async (fn?: () => Promise<void>) => {
    setIsSubmitDisabled(true)
    setIsOpen(true)
    setIsLoading(true)

    try {
      await fn?.()
    } catch (error) {
      setIsOpen(false)
      throw error
    } finally {
      setIsLoading(false)
      setIsSubmitDisabled(false)
    }
  }

  /**
   * ダイアログを閉じる
   */
  const close = (fn?: () => void) => {
    if (isCloseDisabled) {
      return
    }

    setIsOpen(false)

    fn?.()
  }

  /**
   * 送信
   */
  const submit = async (fn?: () => Promise<void>) => {
    if (isSubmitDisabled) {
      return
    }

    setIsSubmitDisabled(true)
    setIsCloseDisabled(true)

    try {
      await fn?.()
      setIsOpen(false)
    } finally {
      setIsSubmitDisabled(false)
      setIsCloseDisabled(false)
    }
  }

  return {
    isOpen,
    isLoading,
    isCloseDisabled,
    isSubmitDisabled,
    open,
    close,
    submit,
  }
}
