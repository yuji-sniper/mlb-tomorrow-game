"use client";

import { useLiffContext } from "@/hooks/useLiffContext";

export default function Home() {
  const { liff, liffError } = useLiffContext();

  return (
    <div>
      <h1>Home</h1>
      <p>{liff?.getIDToken()}</p>
      <p>{liffError}</p>
    </div>
  );
}
