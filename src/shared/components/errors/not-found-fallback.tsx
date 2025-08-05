import { Button } from "@/shared/components/ui/button/button";
import Link from "next/link";

export function NotFoundFallback() {
  return (
    <div>
      <h2>お探しのページは見つかりませんでした。</h2>
      <Button>
        <Link href="/">
          トップへ
        </Link>
      </Button>
    </div>
  )
}
