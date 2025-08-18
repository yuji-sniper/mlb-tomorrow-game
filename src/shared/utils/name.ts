/**
 * フルネームから姓を取得する
 */
export const getLastName = (fullName: string) => {
  const parts = fullName.split(" ")
  return parts[parts.length - 1] ?? fullName
}
