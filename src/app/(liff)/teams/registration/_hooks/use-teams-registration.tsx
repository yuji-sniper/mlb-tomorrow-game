import { useEffect, useMemo, useState } from "react";
import { Team } from "@/shared/types/team";
import { useLiffContext } from "@/shared/contexts/liff-context";
import { useErrorHandlerContext } from "@/shared/contexts/error-handler-context";
import { useSnackbarContext } from "@/shared/contexts/snackbar-context";
import { ERROR_CODE } from "@/shared/constants/error";
import { useInitialization } from "@/shared/contexts/initialization-context";
import { initializeAction } from "../_actions/initialize-action";
import { registerTeamsAction } from "../_actions/register-teams-action";
import { BADGE_TYPE, BadgeType } from "@/shared/constants/badge";

type UseTeamsRegistration = (
  teams: Team[]
) => {
  // 状態
  isOpenSaveTeamsDialog: boolean;
  isSubmitting: boolean;
  // メモ化
  selectedTeams: Team[];
  isSaveButtonDisabled: boolean;
  // 関数
  handleTeamCardClick: (team: Team) => void;
  handleSaveButtonClick: () => void;
  handleSaveTeamsDialogCancel: () => void;
  isTeamCardActive: (teamId: Team['id']) => boolean;
  getTeamBadgeType: (teamId: Team['id']) => BadgeType | undefined;
  submit: () => Promise<void>;
}

export const useTeamsRegistration: UseTeamsRegistration = (
  teams: Team[]
) => {
  const { isInitialized, setIsInitialized } = useInitialization();
  const {liff, relogin} = useLiffContext();
  const { handleError } = useErrorHandlerContext();
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbarContext();
  const [selectedTeamIds, setSelectedTeamIds] = useState<Team['id'][]>([]);
  const [newSelectedTeamIds, setNewSelectedTeamIds] = useState<Team['id'][]>([]);
  const [isOpenSaveTeamsDialog, setIsOpenSaveTeamsDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 選択されているチーム
   */
  const selectedTeams = useMemo(() => (
    teams.filter((team) => 
      newSelectedTeamIds.includes(team.id)
    )
  ), [teams, newSelectedTeamIds]);

  /**
   * 追加されたチーム
   */
  const addedTeamIds = useMemo(() => (
    newSelectedTeamIds.filter((id) => !selectedTeamIds.includes(id))
  ), [newSelectedTeamIds, selectedTeamIds]);

  /**
   * 削除されたチーム
   */
  const removedTeamIds = useMemo(() => (
    selectedTeamIds.filter((id) => !newSelectedTeamIds.includes(id))
  ), [selectedTeamIds, newSelectedTeamIds]);

  /**
   * 保存ボタンの無効化判定
   */
  const isSaveButtonDisabled = useMemo(() => (
    isOpenSaveTeamsDialog ||
    isSubmitting ||
    (addedTeamIds.length === 0 && removedTeamIds.length === 0)
  ), [
    isOpenSaveTeamsDialog,
    isSubmitting,
    addedTeamIds,
    removedTeamIds,
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
      const { registeredTeamIds } = response.data;

      // データをセット
      setSelectedTeamIds(registeredTeamIds);
      setNewSelectedTeamIds(registeredTeamIds);

      setIsInitialized(true);
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        'Failed to initialize teams registration',
        error,
      );
    }
  };

  /**
   * 初期化実行
   */
  useEffect(() => {
    initialize();
  }, [liff]);

  /**
   * チームの選択を切り替える
   */
  const handleTeamCardClick = (team: Team) => {
    setNewSelectedTeamIds((prev) =>
      prev.includes(team.id)
        ? prev.filter((id) => id !== team.id)
        : [...prev, team.id]
    );
  };

  /**
   * 保存ボタンをクリックする
   */
  const handleSaveButtonClick = () => {
    setIsOpenSaveTeamsDialog(true);
  };

  /**
   * 保存ダイアログを閉じる
   */
  const handleSaveTeamsDialogCancel = () => {
    setIsOpenSaveTeamsDialog(false);
  };

  /**
   * チームカードのアクティブ状態を返す
   */
  const isTeamCardActive = (teamId: Team['id']) => {
    return newSelectedTeamIds.includes(teamId);
  }

  /**
   * チームカードに表示するバッジタイプを取得する
   */
  const getTeamBadgeType = (teamId: Team['id']) => {
    if (removedTeamIds.includes(teamId)) {
      return BADGE_TYPE.REMOVE;
    }
    if (addedTeamIds.includes(teamId)) {
      return BADGE_TYPE.ADD;
    }
    if (selectedTeamIds.includes(teamId)) {
      return BADGE_TYPE.CHECK;
    }
    return;
  };

  /**
   * 送信処理
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

      // 送信APIを呼び出し
      const request = {
        lineIdToken,
        selectedTeamIds: newSelectedTeamIds,
      };
      const response = await registerTeamsAction(request);
      if (!response.ok) {
        if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
          relogin();
          return;
        }
        throw new Error(response.error.message);
      }
      const { registeredTeamIds } = response.data;

      // データをセット
      setSelectedTeamIds(registeredTeamIds);

      showSuccessSnackbar('チームを登録しました');
    } catch (error) {
      console.error(error);
      showErrorSnackbar('チームの登録に失敗しました');
    } finally {
      setIsSubmitting(false);
      setIsOpenSaveTeamsDialog(false);
    }
  };

  return {
    // 状態
    isOpenSaveTeamsDialog,
    isSubmitting,
    // メモ化
    selectedTeams,
    isSaveButtonDisabled,
    // 関数
    handleTeamCardClick,
    handleSaveButtonClick,
    handleSaveTeamsDialogCancel,
    isTeamCardActive,
    getTeamBadgeType,
    submit,
  };
}
