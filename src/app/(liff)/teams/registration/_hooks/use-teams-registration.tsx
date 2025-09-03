import { useCallback, useEffect, useState } from "react"
import { BADGE_TYPE, type BadgeType } from "@/shared/constants/badge"
import { ERROR_CODE } from "@/shared/constants/error"
import { useErrorHandlerContext } from "@/shared/contexts/error-handler-context"
import { useInitializationContext } from "@/shared/contexts/initialization-context"
import { useLiffContext } from "@/shared/contexts/liff-context"
import { useDialog } from "@/shared/hooks/use-dialog"
import type { Team } from "@/shared/types/team"
import { initializeAction } from "../_actions/initialize-action"
import { registerTeamAction } from "../_actions/register-team-action"
import { unregisterTeamAction } from "../_actions/unregister-team-action"

type UseTeamsRegistration = () => {
  // 状態
  selectedTeam?: Team
  isRegisterConfirmDialogOpen: boolean
  isUnregisterConfirmDialogOpen: boolean
  isRegisterConfirmDialogSubmitDisabled: boolean
  isUnregisterConfirmDialogSubmitDisabled: boolean
  // 関数
  isTeamCardActive: (teamId: Team["id"]) => boolean
  getTeamBadgeType: (teamId: Team["id"]) => BadgeType | undefined
  handleTeamCardClick: (team: Team) => void
  handleRegisterConfirmDialogCancel: () => void
  handleRegisterConfirmDialogSubmit: () => Promise<{ ok: boolean }>
  handleUnregisterConfirmDialogCancel: () => void
  handleUnregisterConfirmDialogSubmit: () => Promise<{ ok: boolean }>
}

export const useTeamsRegistration: UseTeamsRegistration = () => {
  const { isInitialized, setIsInitialized } = useInitializationContext()
  const { liff, relogin } = useLiffContext()
  const { handleError } = useErrorHandlerContext()

  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>()
  const [registeredTeamIds, setRegisteredTeamIds] = useState<Team["id"][]>([])

  /**
   * 登録確認ダイアログのフック
   */
  const {
    isOpen: isRegisterConfirmDialogOpen,
    isSubmitDisabled: isRegisterConfirmDialogSubmitDisabled,
    openAfter: openRegisterConfirmDialogAfter,
    close: closeRegisterConfirmDialog,
    submit: submitRegisterConfirmDialog,
  } = useDialog()

  /**
   * 登録解除確認ダイアログのフック
   */
  const {
    isOpen: isUnregisterConfirmDialogOpen,
    isSubmitDisabled: isUnregisterConfirmDialogSubmitDisabled,
    openAfter: openUnregisterConfirmDialogAfter,
    close: closeUnregisterConfirmDialog,
    submit: submitUnregisterConfirmDialog,
  } = useDialog()

  /**
   * 初期化
   */
  const initialize = useCallback(async () => {
    if (isInitialized || !liff) {
      return
    }

    try {
      // LINE IDトークン取得
      const lineIdToken = liff.getIDToken()
      if (!lineIdToken) {
        relogin()
        return
      }

      // 初期化APIを呼び出し
      const request = {
        lineIdToken,
      }
      const response = await initializeAction(request)
      if (!response.ok) {
        if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
          relogin()
          return
        }
        throw new Error(response.error.message)
      }
      const { registeredTeamIds } = response.data

      // データをセット
      setRegisteredTeamIds(registeredTeamIds)

      setIsInitialized(true)
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        "Failed to initialize teams registration",
        error,
      )
    }
  }, [isInitialized, liff, relogin, handleError, setIsInitialized])

  /**
   * 初期化実行
   */
  useEffect(() => {
    initialize()
  }, [initialize])

  /**
   * チームカードのアクティブ状態を返す
   */
  const isTeamCardActive = (teamId: Team["id"]) => {
    return registeredTeamIds.includes(teamId) || selectedTeam?.id === teamId
  }

  /**
   * チームカードに表示するバッジタイプを取得する
   */
  const getTeamBadgeType = (teamId: Team["id"]) => {
    return registeredTeamIds.includes(teamId) ? BADGE_TYPE.CHECK : undefined
  }

  /**
   * チームカードをクリックする
   */
  const handleTeamCardClick = (team: Team) => {
    if (registeredTeamIds.includes(team.id)) {
      openUnregisterConfirmDialogAfter(async () => {
        setSelectedTeam(team)
      })
    } else {
      openRegisterConfirmDialogAfter(async () => {
        setSelectedTeam(team)
      })
    }
  }

  /**
   * 登録確認ダイアログを閉じる
   */
  const handleRegisterConfirmDialogCancel = () => {
    closeRegisterConfirmDialog(() => {
      setSelectedTeam(undefined)
    })
  }

  /**
   * 登録確認ダイアログ送信処理
   */
  const handleRegisterConfirmDialogSubmit = async () => {
    try {
      await submitRegisterConfirmDialog(async () => {
        if (!liff) {
          throw new Error("LIFF is not initialized")
        }

        // LINE IDトークン取得
        const lineIdToken = liff.getIDToken()
        if (!lineIdToken) {
          relogin()
          return
        }

        // チームが選択されていない場合はエラー
        if (!selectedTeam) {
          throw new Error("team is not selected")
        }

        // 送信APIを呼び出し
        const request = {
          lineIdToken,
          teamId: selectedTeam.id,
        }
        const response = await registerTeamAction(request)
        if (!response.ok) {
          if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
            relogin()
            return
          }
          throw new Error(response.error.message)
        }

        // データをセット
        setRegisteredTeamIds([...registeredTeamIds, selectedTeam.id])
      })

      return { ok: true }
    } catch (error) {
      console.error(error)

      return { ok: false }
    } finally {
      closeRegisterConfirmDialog(() => {
        setSelectedTeam(undefined)
      })
    }
  }

  /**
   * 登録解除確認ダイアログを閉じる
   */
  const handleUnregisterConfirmDialogCancel = () => {
    closeUnregisterConfirmDialog(() => {
      setSelectedTeam(undefined)
    })
  }

  /**
   * 登録解除確認ダイアログ送信処理
   */
  const handleUnregisterConfirmDialogSubmit = async () => {
    try {
      await submitUnregisterConfirmDialog(async () => {
        if (!liff) {
          throw new Error("LIFF is not initialized")
        }

        // LINE IDトークン取得
        const lineIdToken = liff.getIDToken()
        if (!lineIdToken) {
          relogin()
          return
        }

        // チームが選択されていない場合はエラー
        if (!selectedTeam) {
          throw new Error("team is not selected")
        }

        // 送信APIを呼び出し
        const request = {
          lineIdToken,
          teamId: selectedTeam.id,
        }
        const response = await unregisterTeamAction(request)
        if (!response.ok) {
          if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
            relogin()
            return
          }
          throw new Error(response.error.message)
        }

        // データをセット
        setRegisteredTeamIds(
          registeredTeamIds.filter((id) => id !== selectedTeam.id),
        )
      })

      return { ok: true }
    } catch (error) {
      console.error(error)

      return { ok: false }
    } finally {
      closeUnregisterConfirmDialog(() => {
        setSelectedTeam(undefined)
      })
    }
  }

  return {
    // 状態
    selectedTeam,
    isRegisterConfirmDialogOpen,
    isUnregisterConfirmDialogOpen,
    isRegisterConfirmDialogSubmitDisabled,
    isUnregisterConfirmDialogSubmitDisabled,
    // 関数
    isTeamCardActive,
    getTeamBadgeType,
    handleTeamCardClick,
    handleRegisterConfirmDialogCancel,
    handleRegisterConfirmDialogSubmit,
    handleUnregisterConfirmDialogCancel,
    handleUnregisterConfirmDialogSubmit,
  }
}
