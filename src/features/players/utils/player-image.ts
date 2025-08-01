/**
 * MLB選手の画像URLを生成する
 * @param playerId 選手ID
 * @param width 画像の幅（デフォルト: 60）
 * @returns 画像URL
 */
export function generatePlayerImageUrl(playerId: number, width: number = 60): string {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/w_${width},d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${playerId}/headshot/67/current`;
}
