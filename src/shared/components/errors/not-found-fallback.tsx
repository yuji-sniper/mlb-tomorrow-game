import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button/button"

export function NotFoundFallback() {
  const router = useRouter()
  return (
    <div>
      <h2>お探しのページは見つかりませんでした。</h2>
      <Button text="トップへ" onClick={() => router.push("/")} />
    </div>
  )
}
