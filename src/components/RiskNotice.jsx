import React from "react";

// 風險提示資料
const riskNotes = [
  "投資理財有賺有賠，請選擇適合您的投資理財風險承擔程度。",
  "投資人因不同時間進場，將有不同之投資績效，過去之績效亦不代表未來績效之保證。",
  "以過去績效進行模擬投資組合之報酬率時，僅為歷史資料模擬投資組合之結果，不代表本投資組合之實際報酬率及未來績效保證，不同時間進行模擬操作，結果可能不同。",
];
const RiskNoticeComponent = () => {
  return (
    <div className="text-xs text-gray-500 text-left mt-8">
      {/* 免責聲明 */}
      <div className="mb-1">* 重要聲明如下：</div>
      <ol className="list-decimal pl-4">
        {riskNotes.map((risk, index) => (
          <li key={index}>{risk}</li>
        ))}
      </ol>
    </div>
  );
};

export default RiskNoticeComponent;
