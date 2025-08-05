'use client';

import { Button } from "@/shared/components/ui/button/button";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Button>
        <Link href="/teams/registration">
          チーム登録へ
        </Link>
      </Button>
      <Button>
        <Link href="/pitchers/registration">
          投手登録へ
        </Link>
      </Button>
    </>
  );
}
