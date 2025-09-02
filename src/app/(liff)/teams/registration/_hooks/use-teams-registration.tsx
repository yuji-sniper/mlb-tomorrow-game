import { useCallback, useEffect, useState } from "react"
import { BADGE_TYPE, type BadgeType } from "@/shared/constants/badge"
import { ERROR_CODE } from "@/shared/constants/error"
import { useErrorHandlerContext } from "@/shared/contexts/error-handler-context"
import { useInitializationContext } from "@/shared/contexts/initialization-context"
import { useLiffContext } from "@/shared/contexts/liff-context"
import { useSnackbarContext } from "@/shared/contexts/snackbar-context"
import type { Team } from "@/shared/types/team"
import { initializeAction } from "../_actions/initialize-action"
import { registerTeamAction } from "../_actions/register-team-action"
import { unregisterTeamAction } from "../_actions/unregister-team-action"

type UseTeamsRegistration = () => {
  // 状態
  selectedTeam?: Team
  isOpenRegisterConfirmDialog: boolean
  isOpenUnregisterConfirmDialog: boolean
  isSubmitting: boolean
  // 関数
  isTeamCardActive: (teamId: Team["id"]) => boolean
  getTeamBadgeType: (teamId: Team["id"]) => BadgeType | undefined
  handleTeamCardClick: (team: Team) => void
  handleRegisterConfirmDialogCancel: () => void
  handleRegisterConfirmDialogSubmit: () => void
  handleUnregisterConfirmDialogCancel: () => void
  handleUnregisterConfirmDialogSubmit: () => void
}

export const useTeamsRegistration: UseTeamsRegistration = () => {
  const { isInitialized, setIsInitialized } = useInitializationContext()
  const { liff, relogin } = useLiffContext()
  const { handleError } = useErrorHandlerContext()
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbarContext()

  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>()
  const [registeredTeamIds, setRegisteredTeamIds] = useState<Team["id"][]>([])
  const [isOpenRegisterConfirmDialog, setIsOpenRegisterConfirmDialog] =
    useState(false)
  const [isOpenUnregisterConfirmDialog, setIsOpenUnregisterConfirmDialog] =
    useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setSelectedTeam(team)
    if (registeredTeamIds.includes(team.id)) {
      setIsOpenUnregisterConfirmDialog(true)
    } else {
      setIsOpenRegisterConfirmDialog(true)
    }
  }

  /**
   * 登録確認ダイアログを閉じる
   */
  const handleRegisterConfirmDialogCancel = () => {
    setSelectedTeam(undefined)
    setIsOpenRegisterConfirmDialog(false)
  }

  /**
   * 登録確認ダイアログ送信処理
   */
  const handleRegisterConfirmDialogSubmit = async () => {
    setIsSubmitting(true)

    try {
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

      showSuccessSnackbar("チームを登録しました")
    } catch (error) {
      console.error(error)
      showErrorSnackbar("チームの登録に失敗しました")
    } finally {
      setIsSubmitting(false)
      setSelectedTeam(undefined)
      setIsOpenRegisterConfirmDialog(false)
    }
  }

  /**
   * 登録解除確認ダイアログを閉じる
   */
  const handleUnregisterConfirmDialogCancel = () => {
    setSelectedTeam(undefined)
    setIsOpenUnregisterConfirmDialog(false)
  }

  /**
   * 登録解除確認ダイアログ送信処理
   */
  const handleUnregisterConfirmDialogSubmit = async () => {
    setIsSubmitting(true)

    try {
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

      showSuccessSnackbar("チームの登録を解除しました")
    } catch (error) {
      console.error(error)
      showErrorSnackbar("チームの登録解除に失敗しました")
    } finally {
      setIsSubmitting(false)
      setSelectedTeam(undefined)
      setIsOpenUnregisterConfirmDialog(false)
    }
  }

  return {
    // 状態
    selectedTeam,
    isOpenRegisterConfirmDialog,
    isOpenUnregisterConfirmDialog,
    isSubmitting,
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
