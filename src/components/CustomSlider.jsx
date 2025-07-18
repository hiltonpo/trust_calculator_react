import React, { useState } from "react";

// 自定義滑動條組件
const CustomSlider = ({
  min,
  max,
  step,
  value,
  onChange,
  color,
  className,
  disabled = false,
}) => {
  // 計算進度百分比
  const percentage = ((value - min) / (max - min)) * 100;

  // 處理滑動條變化
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onChange?.(newValue);
  };

  const thumbStyles = {
    width: "24px",
    height: "24px",
    background: color,
    border: `4px solid ${color}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    cursor: "pointer",
    borderRadius: "50%",
  };

  return (
    <div className="relative">
      <style>{`
        .custom-slider::-webkit-slider-thumb {
          appearance: none;
          width: ${thumbStyles.width};
          height: ${thumbStyles.height};
          background: white;
          border: ${thumbStyles.border};
          border-radius: ${thumbStyles.borderRadius};
          box-shadow: ${thumbStyles.boxShadow};
          cursor: ${thumbStyles.cursor};
          transform: ${thumbStyles.transform};
        }

        .custom-slider::-moz-range-thumb {
          appearance: none;
          width: ${thumbStyles.width};
          height: ${thumbStyles.height};
          background: white;
          border: ${thumbStyles.border};
          border-radius: ${thumbStyles.borderRadius};
          box-shadow: ${thumbStyles.boxShadow};
          cursor: ${thumbStyles.cursor};
          transform: ${thumbStyles.transform};
        }
      `}</style>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`custom-slider w-full h-3 rounded-full appearance-none cursor-pointer ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } ${className}`}
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
        }}
      />
    </div>
  );
};

export default CustomSlider;
