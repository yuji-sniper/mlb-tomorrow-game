import { Button } from "@/shared/components/ui/button/button";

export function NotFoundFallback() {
  return (
    <div>
      <h2>お探しのページは見つかりませんでした。</h2>
      <Button
        text="トップへ"
        onClick={() => window.location.href = '/'}
      />
    </div>
  )
}
