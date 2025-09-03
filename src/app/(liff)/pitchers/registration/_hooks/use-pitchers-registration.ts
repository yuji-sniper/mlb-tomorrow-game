import { useCallback, useEffect, useMemo, useState } from "react"
import { ERROR_CODE } from "@/shared/constants/error"
import { useErrorHandlerContext } from "@/shared/contexts/error-handler-context"
import { useInitializationContext } from "@/shared/contexts/initialization-context"
import { useLiffContext } from "@/shared/contexts/liff-context"
import { useDialog } from "@/shared/hooks/use-dialog"
import type { Player } from "@/shared/types/player"
import type { Team } from "@/shared/types/team"
import { fetchPitchersByTeamIdAction } from "../_actions/fetch-pitchers-by-team-id-action"
import { initializeAction } from "../_actions/initialize-action"
import { registerPitchersAction } from "../_actions/register-pitchers-action"

type UsePitchersRegistration = () => {
  // 状態
  selectedTeam: Team | undefined
  currentTeamPlayers: Player[]
  isPlayersRegisterDialogOpen: boolean
  isPlayersRegisterDialogLoading: boolean
  isPlayersRegisterDialogCloseDisabled: boolean
  isPlayersRegisterDialogSubmitDisabled: boolean
  isUnsavedDialogOpen: boolean
  // メモ
  isModifiedPlayers: boolean
  // 関数
  isTeamCardActive: (teamId: Team["id"]) => boolean
  isPlayerActive: (playerId: Player["id"]) => boolean
  getRegisteredCountOfTeam: (teamId: Team["id"]) => number
  handleTeamCardClick: (team: Team) => Promise<{ ok: boolean }>
  handlePlayerClick: (player: Player) => void
  handlePlayersRegisterDialogClose: () => void
  handlePlayersRegisterDialogSubmit: () => Promise<{ ok: boolean }>
  handleUnsavedDialogCancel: () => void
  handleUnsavedDialogSubmit: () => void
}

export const usePitchersRegistration: UsePitchersRegistration = () => {
  const { isInitialized, setIsInitialized } = useInitializationContext()
  const { liff, relogin } = useLiffContext()
  const { handleError } = useErrorHandlerContext()

  const [selectedTeam, setSelectedTeam] = useState<Team>()
  const [currentTeamPlayers, setCurrentTeamPlayers] = useState<Player[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Player["id"][]>([])
  const [playersGroupedByTeamId, setPlayersGroupedByTeamId] = useState<
    Record<Team["id"], Player[]>
  >({})
  const [registeredPlayerIdsByTeamId, setRegisteredPlayerIdsByTeamId] =
    useState<Record<Team["id"], Player["id"][]>>({})

  /**
   * ピッチャー登録ダイアログのフック
   */
  const {
    isOpen: isPlayersRegisterDialogOpen,
    isLoading: isPlayersRegisterDialogLoading,
    isCloseDisabled: isPlayersRegisterDialogCloseDisabled,
    isSubmitDisabled: isPlayersRegisterDialogSubmitDisabled,
    open: openPlayersRegisterDialog,
    close: closePlayersRegisterDialog,
    submit: submitPlayersRegisterDialog,
  } = useDialog()

  /**
   * 未保存アラートダイアログのフック
   */
  const {
    isOpen: isUnsavedDialogOpen,
    openAfter: openUnsavedDialogAfter,
    close: closeUnsavedDialog,
  } = useDialog()

  /**
   * 選手の選択を変更したかどうか
   */
  const isModifiedPlayers = useMemo(() => {
    if (!selectedTeam) {
      return false
    }

    const registeredPlayerIds =
      registeredPlayerIdsByTeamId[selectedTeam.id] || []

    // 登録された選手IDと選択された選手IDの長さが違う場合は変更あり
    if (registeredPlayerIds.length !== selectedPlayerIds.length) {
      return true
    }

    // 登録中の選手IDと選択中の選手IDが一致しない場合は変更あり
    return registeredPlayerIds.some((id) => !selectedPlayerIds.includes(id))
  }, [selectedTeam, selectedPlayerIds, registeredPlayerIdsByTeamId])

  /**
   * 選択状態をリセットする
   */
  const resetSelections = () => {
    setSelectedTeam(undefined)
    setSelectedPlayerIds([])
  }

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
  const isTeamCardActive = useCallback(
    (teamId: Team["id"]) => {
      return (
        selectedTeam?.id === teamId ||
        registeredPlayerIdsByTeamId[teamId]?.length > 0
      )
    },
    [selectedTeam, registeredPlayerIdsByTeamId],
  )

  /**
   * 選手のアクティブ状態を返す
   */
  const isPlayerActive = useCallback(
    (playerId: Player["id"]) => {
      if (!selectedTeam) {
        return false
      }

      return selectedPlayerIds.includes(playerId)
    },
    [selectedTeam, selectedPlayerIds],
  )

  /**
   * チームのピッチャー登録数を返す
   */
  const getRegisteredCountOfTeam = useCallback(
    (teamId: Team["id"]) => {
      return registeredPlayerIdsByTeamId[teamId]?.length || 0
    },
    [registeredPlayerIdsByTeamId],
  )

  /**
   * チームカードクリック時の処理
   */
  const handleTeamCardClick = async (team: Team): Promise<{ ok: boolean }> => {
    try {
      await openPlayersRegisterDialog(async () => {
        setSelectedTeam(team)
        setSelectedPlayerIds(registeredPlayerIdsByTeamId[team.id] || [])

        // チームのピッチャーがすでに取得済みの場合は、そのままダイアログを開く
        const players = playersGroupedByTeamId[team.id]
        if (players) {
          setCurrentTeamPlayers(players)
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
        setCurrentTeamPlayers(fetchedPlayers)
      })

      return { ok: true }
    } catch (error) {
      resetSelections()

      console.error(error)

      return { ok: false }
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
    // 変更があるのに閉じる場合は未保存アラートダイアログを表示
    if (isModifiedPlayers) {
      openUnsavedDialogAfter(async () => {
        closePlayersRegisterDialog()
      })
      return
    }

    closePlayersRegisterDialog(() => {
      resetSelections()
    })
  }

  /**
   * ピッチャーの登録を行う
   */
  const handlePlayersRegisterDialogSubmit = async (): Promise<{
    ok: boolean
  }> => {
    try {
      await submitPlayersRegisterDialog(async () => {
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

        resetSelections()
      })

      return { ok: true }
    } catch (error) {
      console.error(error)

      return { ok: false }
    }
  }

  /**
   * 未保存アラートダイアログのキャンセルボタンを押した時の処理
   */
  const handleUnsavedDialogCancel = () => {
    openPlayersRegisterDialog(async () => {
      closeUnsavedDialog()
    })
  }

  /**
   * 未保存アラートダイアログの送信ボタンを押した時の処理
   */
  const handleUnsavedDialogSubmit = () => {
    closeUnsavedDialog(() => {
      resetSelections()
    })
  }

  return {
    // 状態
    selectedTeam,
    currentTeamPlayers,
    isPlayersRegisterDialogOpen,
    isPlayersRegisterDialogLoading,
    isPlayersRegisterDialogCloseDisabled,
    isPlayersRegisterDialogSubmitDisabled,
    isUnsavedDialogOpen,
    // メモ
    isModifiedPlayers,
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
