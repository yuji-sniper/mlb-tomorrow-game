"use client";

import { LiffContext } from "@/contexts/LiffContext";
import { useEffect, useState } from "react";
import liff, { Liff } from "@line/liff";

export default function Template({ children }: { children: React.ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);

  // TODO: liffが必要な箇所だけClient Componentにする
  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
      .then(() => {
        console.log("LIFF init success");
        setLiffObject(liff);
      })
      .catch((error: Error) => {
        console.log("LIFF init error", error);
        setLiffError(error.toString());
      });
  }, []);

  return (
    <LiffContext value={{ liff: liffObject, liffError }}>
      {children}
    </LiffContext>
  );
}
