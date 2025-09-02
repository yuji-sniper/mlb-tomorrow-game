import { useCallback, useEffect, useMemo, useState } from "react"
import { ERROR_CODE } from "@/shared/constants/error"
import { useErrorHandlerContext } from "@/shared/contexts/error-handler-context"
import { useInitializationContext } from "@/shared/contexts/initialization-context"
import { useLiffContext } from "@/shared/contexts/liff-context"
import { useSnackbarContext } from "@/shared/contexts/snackbar-context"
import type { Player } from "@/shared/types/player"
import type { Team } from "@/shared/types/team"
import { fetchPitchersByTeamIdAction } from "../_actions/fetch-pitchers-by-team-id-action"
import { initializeAction } from "../_actions/initialize-action"
import { registerPitchersAction } from "../_actions/register-pitchers-action"

type UsePitchersRegistration = () => {
  // 状態
  selectedTeam: Team | undefined
  playersGroupedByTeamId: Record<Team["id"], Player[]>
  isPlayersRegisterDialogLoading: boolean
  isSubmitting: boolean
  isUnsavedDialogOpen: boolean
  // メモ
  isSubmitDisabled: boolean
  // 関数
  isTeamCardActive: (teamId: Team["id"]) => boolean
  isPlayerActive: (playerId: Player["id"]) => boolean
  getRegisteredCountOfTeam: (teamId: Team["id"]) => number
  handleTeamCardClick: (team: Team) => void
  handlePlayerClick: (player: Player) => void
  handlePlayersRegisterDialogClose: () => void
  handlePlayersRegisterDialogSubmit: () => void
  handleUnsavedDialogCancel: () => void
  handleUnsavedDialogSubmit: () => void
}

export const usePitchersRegistration: UsePitchersRegistration = () => {
  const { isInitialized, setIsInitialized } = useInitializationContext()
  const { liff, relogin } = useLiffContext()
  const { handleError } = useErrorHandlerContext()
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbarContext()

  const [selectedTeam, setSelectedTeam] = useState<Team>()
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Player["id"][]>([])
  const [playersGroupedByTeamId, setPlayersGroupedByTeamId] = useState<
    Record<Team["id"], Player[]>
  >({})
  const [isPlayersRegisterDialogLoading, setIsPlayersRegisterDialogLoading] =
    useState(false)
  const [registeredPlayerIdsByTeamId, setRegisteredPlayerIdsByTeamId] =
    useState<Record<Team["id"], Player["id"][]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false)

  /**
   * ピッチャー登録ダイアログをリセットする
   */
  const resetPlayersRegisterDialog = () => {
    setSelectedTeam(undefined)
    setSelectedPlayerIds([])
    setIsPlayersRegisterDialogLoading(false)
  }

  /**
   * 登録ボタンの無効状態を返す
   */
  const isSubmitDisabled = useMemo(() => {
    if (!selectedTeam) {
      return true
    }

    const registeredPlayerIds =
      registeredPlayerIdsByTeamId[selectedTeam.id] || []

    // 登録された選手IDと選択された選手IDの長さが同じ場合は無効
    if (registeredPlayerIds.length !== selectedPlayerIds.length) {
      return false
    }

    // 登録された選手IDと選択された選手IDが一致する場合は無効
    return registeredPlayerIds.every((id) => selectedPlayerIds.includes(id))
  }, [selectedTeam, selectedPlayerIds, registeredPlayerIdsByTeamId])

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
      const { registeredPlayerIdsByTeamId } = response.data

      // データをセット
      setRegisteredPlayerIdsByTeamId(registeredPlayerIdsByTeamId)

      setIsInitialized(true)
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        "Failed to initialize pitchers registration",
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
    return (
      selectedTeam?.id === teamId ||
      registeredPlayerIdsByTeamId[teamId]?.length > 0
    )
  }

  /**
   * 選手のアクティブ状態を返す
   */
  const isPlayerActive = (playerId: Player["id"]) => {
    if (!selectedTeam) {
      return false
    }

    return selectedPlayerIds.includes(playerId)
  }

  /**
   * チームのピッチャー登録数を返す
   */
  const getRegisteredCountOfTeam = (teamId: Team["id"]) => {
    return registeredPlayerIdsByTeamId[teamId]?.length || 0
  }

  /**
   * チームカードクリック時の処理
   */
  const handleTeamCardClick = async (team: Team) => {
    setSelectedTeam(team)
    setIsPlayersRegisterDialogLoading(true)
    setSelectedPlayerIds(registeredPlayerIdsByTeamId[team.id] || [])

    try {
      // チームのピッチャーがすでに取得済みの場合は、そのままダイアログを開く
      const players = playersGroupedByTeamId[team.id]
      if (players) {
        setIsPlayersRegisterDialogLoading(false)
        return
      }

      // チームのピッチャーを取得
      const request = {
        teamId: team.id,
      }
      const response = await fetchPitchersByTeamIdAction(request)
      if (!response.ok) {
        throw new Error(response.error.message)
      }
      const { players: fetchedPlayers } = response.data

      // データをセット
      setPlayersGroupedByTeamId((prev) => ({
        ...prev,
        [team.id]: fetchedPlayers,
      }))
    } catch (error) {
      console.error(error)
      showErrorSnackbar("ピッチャーの取得に失敗しました")
    } finally {
      setIsPlayersRegisterDialogLoading(false)
    }
  }

  /**
   * 選手をクリックする
   */
  const handlePlayerClick = (player: Player) => {
    // 選手の選択状態を切り替える
    setSelectedPlayerIds((prev) => {
      const isSelected = prev.some((id) => id === player.id)
      if (isSelected) {
        return prev.filter((id) => id !== player.id)
      } else {
        return [...prev, player.id]
      }
    })
  }

  /**
   * 選手選択ダイアログを閉じる
   */
  const handlePlayersRegisterDialogClose = () => {
    if (!isSubmitDisabled) {
      setIsUnsavedDialogOpen(true)
      return
    }

    resetPlayersRegisterDialog()
  }

  /**
   * ピッチャーの登録を行う
   */
  const handlePlayersRegisterDialogSubmit = async () => {
    setIsSubmitting(true)

    try {
      if (!liff) {
        throw new Error("LIFF is not initialized")
      }

      if (!selectedTeam) {
        throw new Error("Team is not selected")
      }

      // LINE IDトークン取得
      const lineIdToken = liff.getIDToken()
      if (!lineIdToken) {
        relogin()
        return
      }

      // 登録APIを呼び出し
      const request = {
        lineIdToken,
        oldPlayerIds: registeredPlayerIdsByTeamId[selectedTeam.id] || [],
        newPlayerIds: selectedPlayerIds,
      }
      const response = await registerPitchersAction(request)
      if (!response.ok) {
        if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
          relogin()
          return
        }
        throw new Error(response.error.message)
      }

      // データをセット
      setRegisteredPlayerIdsByTeamId((prev) => ({
        ...prev,
        [selectedTeam.id]: selectedPlayerIds,
      }))

      showSuccessSnackbar("ピッチャーを登録しました")
    } catch (error) {
      console.error(error)
      showErrorSnackbar("ピッチャーの登録に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 未保存アラートダイアログのキャンセルボタンを押した時の処理
   */
  const handleUnsavedDialogCancel = () => {
    setIsUnsavedDialogOpen(false)
  }

  /**
   * 未保存アラートダイアログの送信ボタンを押した時の処理
   */
  const handleUnsavedDialogSubmit = () => {
    setIsUnsavedDialogOpen(false)
    resetPlayersRegisterDialog()
  }

  return {
    // 状態
    selectedTeam,
    playersGroupedByTeamId,
    isPlayersRegisterDialogLoading,
    isSubmitDisabled,
    isSubmitting,
    isUnsavedDialogOpen,
    // 関数
    isTeamCardActive,
    isPlayerActive,
    getRegisteredCountOfTeam,
    handleTeamCardClick,
    handlePlayerClick,
    handlePlayersRegisterDialogClose,
    handlePlayersRegisterDialogSubmit,
    handleUnsavedDialogCancel,
    handleUnsavedDialogSubmit,
  }
}
