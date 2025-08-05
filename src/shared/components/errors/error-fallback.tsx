import { Button } from "@/shared/components/ui/button/button";

export function ErrorFallback() {
  return (
    <div>
      <h2>予期せぬエラーが発生しました。</h2>
      <Button onClick={() => window.location.reload()}>
        再読み込み
      </Button>
    </div>
  )
}
