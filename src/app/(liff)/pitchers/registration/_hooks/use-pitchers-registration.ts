import { useEffect, useMemo, useState } from "react";
import { Team } from "@/shared/types/team";
import { Player } from "@/shared/types/player";
import { useInitialization } from "@/shared/contexts/initialization-context";
import { useLiffContext } from "@/shared/contexts/liff-context";
import { useErrorHandlerContext } from "@/shared/contexts/error-handler-context";
import { useSnackbarContext } from "@/shared/contexts/snackbar-context";
import { ERROR_CODE } from "@/shared/constants/error";
import { initializeAction } from "../_actions/initialize-action";
import { fetchPitchersByTeamIdAction } from "../_actions/fetch-pitchers-by-team-id-action";
import { registerPitchersAction } from "../_actions/register-pitchers-action";

type UsePitchersRegistration = () => {
  // 状態
  selectedTeam: Team | undefined;
  playersGroupByTeamId: Record<Team['id'], Player[]>;
  isPlayersSelectionDialogLoading: boolean;
  isSavePlayersDialogOpen: boolean;
  isSubmitting: boolean;
  // メモ化
  selectedPlayers: Player[];
  selectedPlayerIds: Player['id'][];
  isSaveButtonDisabled: boolean;
  // 関数
  handleTeamCardClick: (team: Team) => void;
  handlePlayersSelectionDialogClose: () => void;
  handlePlayerClick: (player: Player) => void;
  handleSaveButtonClick: () => void;
  handleRegisterPlayersDialogCancel: () => void;
  isTeamCardActive: (teamId: Team['id']) => boolean;
  getSelectedCountOfTeam: (teamId: Team['id']) => number;
  submit: () => Promise<void>;
}

export const usePitchersRegistration: UsePitchersRegistration = () => {
  const { isInitialized, setIsInitialized } = useInitialization();
  const {liff, relogin} = useLiffContext();
  const { handleError } = useErrorHandlerContext();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbarContext();
  const [selectedTeam, setSelectedTeam] = useState<Team>();
  const [playersGroupByTeamId, setPlayersGroupByTeamId] = useState<Record<Team['id'], Player[]>>({});
  const [selectedPlayersByTeamId, setSelectedPlayersByTeamId] = useState<Record<Team['id'], Player[]>>({});
  const [isPlayersSelectionDialogLoading, setIsPlayersSelectionDialogLoading] = useState(false);
  const [isSavePlayersDialogOpen, setIsSavePlayersDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 選択された選手を平坦化した配列を返す
   */
  const selectedPlayers = useMemo(() => {
    return Object.values(selectedPlayersByTeamId).flat();
  }, [selectedPlayersByTeamId]);

  /**
   * 選択された選手のIDを返す
   */
  const selectedPlayerIds = useMemo(() => {
    return selectedPlayers.map((player) => player.id);
  }, [selectedPlayers]);

  /**
   * 保存ボタンの無効化判定
   */
  const isSaveButtonDisabled = useMemo(() => (
    isSavePlayersDialogOpen ||
    isSubmitting ||
    selectedPlayerIds.length === 0
  ), [
    isSavePlayersDialogOpen,
    isSubmitting,
    selectedPlayerIds,
  ]);

  /**
   * 初期化
   */
  const initialize = async () => {
    if (isInitialized || !liff) {
      return;
    }
    
    try {
      // LINE IDトークン取得
      const lineIdToken = liff.getIDToken();
      if (!lineIdToken) {
        relogin();
        return;
      }

      // 初期化APIを呼び出し
      const request = {
        lineIdToken,
      };
      const response = await initializeAction(request);
      if (!response.ok) {
        if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
          relogin();
          return;
        }
        throw new Error(response.error.message);
      }
      const { registeredPlayersByTeamId } = response.data;

      // データをセット
      setSelectedPlayersByTeamId(registeredPlayersByTeamId);

      setIsInitialized(true);
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        'Failed to initialize pitchers registration',
        error,
      );
    }
  }

  /**
   * 初期化実行
   */
  useEffect(() => {
    initialize();
  }, [liff]);

  /**
   * チームカードクリック時の処理
   */
  const handleTeamCardClick = async (team: Team) => {
    setSelectedTeam(team);
    setIsPlayersSelectionDialogLoading(true);

    try {
      // チームのピッチャーがすでに取得済みの場合は、そのままダイアログを開く
      const players = playersGroupByTeamId[team.id];
      if (players) {
        setIsPlayersSelectionDialogLoading(false);
        return;
      }

      // チームのピッチャーを取得
      const request = {
        teamId: team.id,
      };
      const response = await fetchPitchersByTeamIdAction(request);
      if (!response.ok) {
        throw new Error(response.error.message);
      }
      const { players: fetchedPlayers } = response.data;

      // データをセット
      setPlayersGroupByTeamId((prev) => ({
        ...prev,
        [team.id]: fetchedPlayers,
      }));
    } catch (error) {
      console.error(error);
      showErrorSnackbar("ピッチャーの取得に失敗しました");
    } finally {
      setIsPlayersSelectionDialogLoading(false);
    }
  }

  /**
   * 選手選択ダイアログを閉じる
   */
  const handlePlayersSelectionDialogClose = () => {
    setSelectedTeam(undefined);
  }

  /**
   * 保存ボタンをクリックする
   */
  const handleSaveButtonClick = () => {
    setIsSavePlayersDialogOpen(true);
  }

  /**
   * 選手登録ダイアログをキャンセルする
   */
  const handleRegisterPlayersDialogCancel = () => {
    setIsSavePlayersDialogOpen(false);
  }

  /**
   * 選手をクリックする
   */
  const handlePlayerClick = (player: Player) => {
    // 選手の選択状態を切り替える
    setSelectedPlayersByTeamId((prev) => {
      const teamId = player.teamId;
      const teamPlayers = prev[teamId] || [];
      const isSelected = teamPlayers.some((p) => p.id === player.id);

      if (isSelected) {
        return {
          ...prev,
          [teamId]: teamPlayers.filter((p) => p.id !== player.id),
        };
      } else {
        return {
          ...prev,
          [teamId]: [...teamPlayers, player],
        };
      }
    });
  };

  /**
   * チームカードのアクティブ状態を返す
   */
  const isTeamCardActive = (teamId: Team['id']) => {
    return (
      selectedTeam?.id === teamId ||
      selectedPlayersByTeamId[teamId]?.length > 0
    );
  }

  /**
   * 選択されたチームのピッチャー数を返す
   */
  const getSelectedCountOfTeam = (teamId: Team['id']) => {
    return selectedPlayersByTeamId[teamId]?.length || 0;
  }

  /**
   * ピッチャーの登録を行う
   */
  const submit = async () => {
    setIsSubmitting(true);

    try {
      if (!liff) {
        throw new Error('LIFF is not initialized');
      }

      // LINE IDトークン取得
      const lineIdToken = liff.getIDToken();
      if (!lineIdToken) {
        relogin();
        return;
      }

      // 登録APIを呼び出し
      const request = {
        lineIdToken,
        selectedPlayerIds,
      };
      const response = await registerPitchersAction(request);
      if (!response.ok) {
        if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
          relogin();
          return;
        }
        throw new Error(response.error.message);
      }
      const { registeredPlayersByTeamId } = response.data;

      // データをセット
      setSelectedPlayersByTeamId(registeredPlayersByTeamId);

      showSuccessSnackbar('ピッチャーを登録しました');
    } catch (error) {
      console.error(error);
      showErrorSnackbar('ピッチャーの登録に失敗しました');
    } finally {
      setIsSubmitting(false);
      setIsSavePlayersDialogOpen(false);
    }
  };

  return {
    // 状態
    selectedTeam,
    playersGroupByTeamId,
    isPlayersSelectionDialogLoading,
    isSavePlayersDialogOpen,
    isSubmitting,
    // メモ化
    selectedPlayers,
    selectedPlayerIds,
    isSaveButtonDisabled,
    // 関数
    handleTeamCardClick,
    handlePlayersSelectionDialogClose,
    handlePlayerClick,
    handleSaveButtonClick,
    handleRegisterPlayersDialogCancel,
    isTeamCardActive,
    getSelectedCountOfTeam,
    submit,
  };
}
