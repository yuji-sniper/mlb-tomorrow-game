export const PLAYER_STATUS = {
  A: {
    display: 'アクティブ',
    priority: 100,
  },
  PL: {
    display: '父親休暇',
    priority: 95,
  },
  BRV: {
    display: '忌引きリスト',
    priority: 90,
  },
  D7: {
    display: '7日間故障者リスト',
    priority: 85,
  },
  D10: {
    display: '10日間故障者リスト',
    priority: 85,
  },
  D15: {
    display: '15日間故障者リスト',
    priority: 80,
  },
  D60: {
    display: '60日間故障者リスト',
    priority: 70,
  },
  FME: {
    display: '家族の医療緊急',
    priority: 50,
  },
  LV: {
    display: '有給休暇',
    priority: 45,
  },
  RM: {
    display: 'マイナー降格',
    priority: 42,
  },
  MIN: {
    display: 'マイナー降格',
    priority: 40,
  },
  NRI: {
    display: '招待選手（NRI）',
    priority: 30,
  },
  DFA: {
    display: 'DFA（戦力外）',
    priority: 25,
  },
  WV: {
    display: 'ウェーバー',
    priority: 20,
  },
  RST: {
    display: '制限リスト',
    priority: 15,
  },
  SUS: {
    display: '出場停止',
    priority: 10,
  },
  FA: {
    display: 'フリーエージェント',
    priority: 5,
  },
  RET: {
    display: '引退',
    priority: 3,
  },
  UDP: {
    display: '未契約ドラフト指名',
    priority: 2,
  },
  '': {
    display: 'トレードまたは未登録',
    priority: 0,
  },
} as const;
