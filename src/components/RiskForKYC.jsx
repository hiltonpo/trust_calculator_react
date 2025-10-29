import React from "react";

const RiskForKYCComponent = ({ input, colors, riskText, handleChange }) => {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">風險等級</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {riskText.map((item, index) => (
            <button
              key={index}
              className={`btnKYC p-4 rounded-lg text-lg font-medium transition-all ${
                input.kyc === item.value
                  ? `${colors.riskBtn} text-white shadow-lg`
                  : "bg-gray-100 opacity-60 hover:opacity-80"
              }`}
              onClick={() => handleChange("kyc", item.value)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default RiskForKYCComponent;
