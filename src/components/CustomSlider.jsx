import React, { useMemo, useCallback } from "react";

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
  name, // 新增：用於無障礙功能
}) => {
  // 計算進度百分比
  const percentage = useMemo(
    () => ((value - min) / (max - min)) * 100,
    [value, min, max]
  );

  // 處理滑動條變化
  const handleChange = useCallback((e) => {
    const newValue = parseInt(e.target.value);
    onChange?.(newValue);
  }, [onChange]);

  // Memoize thumb styles
  const thumbStyles = useMemo(() => ({
    width: "24px",
    height: "24px",
    background: color,
    border: `4px solid ${color}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    cursor: "pointer",
    borderRadius: "50%",
  }), [color]);

  // Memoize gradient background
  const backgroundStyle = useMemo(() => ({
    background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
  }), [color, percentage]);

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
        aria-label={name || "滑動條"}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className={`custom-slider w-full h-3 rounded-full appearance-none cursor-pointer ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } ${className}`}
        style={backgroundStyle}
      />
    </div>
  );
};

export default CustomSlider;
