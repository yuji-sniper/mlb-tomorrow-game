import { Button } from "@/shared/components/ui/button/button";
import Link from "next/link";

export function ErrorFallback() {
  return (
    <div>
      <h2>予期せぬエラーが発生しました。</h2>
      <Button>
        <Link href={window.location.href}>
          再読み込み
        </Link>
      </Button>
    </div>
  )
}
