/**
 * 並行処理を実行する
 * @param tasks 実行するタスクの配列
 * @param concurrency 並行処理の最大数
 * @returns タスクの実行結果の配列
 */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = []
  let index = 0

  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const task = tasks[index++]
      if (!task) break

      const result = await task()
      results.push(result)
    }
  })

  await Promise.all(workers)

  return results
}
