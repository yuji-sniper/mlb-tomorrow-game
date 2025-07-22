import { Liff } from "@line/liff";
import { createContext } from "react";

type LiffContextType = {
  liff: Liff | null;
  liffError: string | null;
};

export const LiffContext = createContext<LiffContextType>({
  liff: null,
  liffError: null,
});
