import { useEffect, useMemo, useState } from "react";
import { Team } from "@/shared/types/team";
import { useLiffContext } from "@/shared/contexts/liff-context";
import { getTeamsRegistrationApiAction, postTeamsRegistrationApiAction } from "../_api/teams-registration-api";
import { useErrorHandlerContext } from "@/shared/contexts/error-handler-context";
import { useSnackbarContext } from "@/shared/contexts/snackbar-context";
import { ERROR_CODE } from "@/shared/constants/error";
import { useInitialization } from "@/shared/contexts/initialization-context";

type UseTeamsRegistration = (
  teams: Team[]
) => {
  selectedTeams: Team[];
  newSelectedTeamIds: Team['id'][];
  isSaveButtonDisabled: boolean;
  isSubmitting: boolean;
  isOpenSaveTeamsDialog: boolean;
  toggleTeamIdSelection: (teamId: Team["id"]) => void;
  getTeamBadgeType: (teamId: Team["id"]) => 'add' | 'remove' | 'check' | null;
  setIsOpenSaveTeamsDialog: (isOpen: boolean) => void;
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
      const lineIdToken = liff.getIDToken();
      if (!lineIdToken) {
        throw new Error('LINE ID token is not found');
      }

      const request = {
        lineIdToken,
      };
      const response = await getTeamsRegistrationApiAction(request);
      if (!response.ok) {
        if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
          relogin();
          return;
        }
        throw new Error(response.error.message);
      }
      const { registeredTeamIds } = response.data;

      setSelectedTeamIds(registeredTeamIds);
      setNewSelectedTeamIds(registeredTeamIds);

      setIsInitialized(true);
    } catch (error) {
      handleError(
        ERROR_CODE.ERROR,
        'Failed to fetch registered teams',
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
  const toggleTeamIdSelection = (teamId: Team["id"]) => {
    setNewSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  /**
   * チームカードに表示するバッジタイプを取得する
   */
  const getTeamBadgeType = (teamId: Team["id"]) => {
    if (removedTeamIds.includes(teamId)) {
      return 'remove';
    }
    if (addedTeamIds.includes(teamId)) {
      return 'add';
    }
    if (selectedTeamIds.includes(teamId)) {
      return 'check';
    }
    return null;
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

      const lineIdToken = liff.getIDToken();
      if (!lineIdToken) {
        relogin();
        return;
      }

      const request = {
        lineIdToken,
        selectedTeamIds: newSelectedTeamIds,
      };
      const response = await postTeamsRegistrationApiAction(request);
      if (!response.ok) {
        if (response.error.code === ERROR_CODE.UNAUTHORIZED) {
          relogin();
          return;
        }
        throw new Error(response.error.message);
      }

      const { registeredTeamIds } = response.data;
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
    selectedTeams,
    newSelectedTeamIds,
    isSaveButtonDisabled,
    isSubmitting,
    isOpenSaveTeamsDialog,
    toggleTeamIdSelection,
    getTeamBadgeType,
    setIsOpenSaveTeamsDialog,
    submit,
  };
}
