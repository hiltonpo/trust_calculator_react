import { useContext } from "react";
import { RiskNotesContext } from "./RiskContext";

// 自定義 Hook
export const useRiskNotes = () => {
  const context = useContext(RiskNotesContext);

  if (!context) {
    throw new Error("useRiskNotes must be used within a RiskNotesProvider");
  }

  return context;
};
