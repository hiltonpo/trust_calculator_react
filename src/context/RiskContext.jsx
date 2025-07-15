import React, { createContext } from "react";

// 風險提示資料
const riskNotes = [
  "投資理財有賺有賠，請選擇適合您的投資理財風險承擔程度。",
  "投資人因不同時間進場，將有不同之投資績效，過去之績效亦不代表未來績效之保證。",
  "以過去績效進行模擬投資組合之報酬率時，僅為歷史資料模擬投資組合之結果，不代表本投資組合之實際報酬率及未來績效保證，不同時間進行模擬操作，結果可能不同。",
];

// 建立 Context
export const RiskNotesContext = createContext();

// Provider 元件
export const RiskNotesProvider = ({ children }) => {
  const contextValue = {
    riskNotes,
    // 可以添加其他相關的方法
    getRiskNote: (index) => riskNotes[index],
    getAllRiskNotes: () => riskNotes,
    getRiskNotesCount: () => riskNotes.length,
  };

  return (
    <RiskNotesContext.Provider value={contextValue}>
      {children}
    </RiskNotesContext.Provider>
  );
};
