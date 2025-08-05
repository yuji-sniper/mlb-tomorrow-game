'use client';

import { Button } from "@/shared/components/ui/button/button";

export default function Page() {
  return (
    <>
      <Button
        text="チーム登録へ"
        onClick={() => {
          window.location.href = '/teams/registration';
        }}
      />
      <Button
        text="投手登録へ"
        onClick={() => {
          window.location.href = '/pitchers/registration';
        }}
      />
    </>
  );
}
