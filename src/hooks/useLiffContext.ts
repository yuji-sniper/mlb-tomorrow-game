import { useContext } from "react";
import { LiffContext } from "@/contexts/LiffContext"

export const useLiffContext = () => {
  const context = useContext(LiffContext);

  if (!context) {
    throw new Error("useLiffContext must be used within a LiffContextProvider");
  }

  return context;
};
