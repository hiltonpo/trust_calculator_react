import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRiskNotes } from "../context/useRiskNotes";

export const WealthPlanCalculator = ({ type = "Golden" }) => {
  const [company] = useState(type);
  const [input, setInput] = useState({
    kyc: 1,
    nowAge: 30,
    invYear: 20,
    invMoney: 100000,
    regMoney: 10000,
  });

  const [switchSet, setSwitchSet] = useState({
    single: true,
    regular: true,
  });

  const [edit, setEdit] = useState({
    single: false,
    regular: false,
  });

  const [switchNTD, setSwitchNTD] = useState(false);
  const [textSingle, setTextSingle] = useState("100,000");
  const [textRegular, setTextRegular] = useState("10,000");
  const [chartData, setChartData] = useState([]);
  const [assetData, setAssetData] = useState([0, 0, 0]);

  // 風險告知
  const { riskNotes } = useRiskNotes();

  // 風險等級選項
  const riskText = [
    { value: 0, text: "保守型" },
    { value: 1, text: "穩健型" },
    { value: 2, text: "積極型" },
    { value: 3, text: "進取型" },
  ];

  // 目標設定選項
  const goalOptions = [
    {
      name: "現在年齡",
      prop: "nowAge",
      max: 100,
      min: 0,
      unit: "歲",
      step: 1,
    },
    {
      name: "投資期間",
      prop: "invYear",
      max: 120,
      min: 3,
      unit: "年",
      step: 1,
    },
  ];

  // 投資選項
  const investOptions = [
    {
      name: "單筆投入金額",
      prop: "invMoney",
      max: 1000000,
      min: 35000,
      unit: "元",
      step: 1000,
    },
    {
      name: "定期定額投入金額",
      prop: "regMoney",
      max: 35000,
      min: 3500,
      unit: "元",
      step: 500,
    },
  ];

  // 報酬率設定 (簡化版)
  const returnRates = {
    0: [0.03, 0.02, 0.01], // 保守型
    1: [0.06, 0.04, 0.02], // 穩健型
    2: [0.09, 0.06, 0.03], // 積極型
    3: [0.12, 0.08, 0.04], // 進取型
  };

  // 樣式配置
  const getCompanyStyles = (company) => {
    const styles = {
      Golden: {
        backgroundColor: "#f2eada",
        textColor: "black",
        thumbColor: "#cc9c50",
        barColor: "#cc9c50",
      },
      JyuMei: {
        backgroundColor: "#FFF7F7",
        textColor: "#393939",
        thumbColor: "#BE0000",
        barColor: "#BE0000",
      },
    };
    return styles[company] || styles.Golden;
  };

  const companyStyles = getCompanyStyles(company);

  // 工具函數
  const toThousand = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const commasToNumber = (str) => {
    return parseInt(str.toString().replace(/,/g, ""), 10) || 0;
  };

  const addCommas = (num) => {
    return toThousand(num);
  };

  const getPreffix = () => {
    return switchNTD ? "NT$" : "$";
  };

  // 計算投資結果
  const calculateInvestment = () => {
    const years = input.invYear;
    const rates = returnRates[input.kyc];
    const singleAmount = switchSet.single ? input.invMoney : 0;
    const regularAmount = switchSet.regular ? input.regMoney : 0;

    const data = [];
    const finalAssets = [];

    rates.forEach((rate, index) => {
      let totalAsset = singleAmount;
      const yearlyData = [];

      for (let year = 0; year <= years; year++) {
        if (year > 0) {
          totalAsset = totalAsset * (1 + rate) + regularAmount * 12;
        }
        yearlyData.push({
          year,
          asset: Math.round(totalAsset),
        });
      }

      finalAssets.push(totalAsset);

      if (index === 0) {
        data.push(
          ...yearlyData.map((item) => ({ ...item, better: item.asset }))
        );
      } else if (index === 1) {
        data.forEach((item, idx) => {
          if (yearlyData[idx]) {
            item.normal = yearlyData[idx].asset;
          }
        });
      } else if (index === 2) {
        data.forEach((item, idx) => {
          if (yearlyData[idx]) {
            item.poor = yearlyData[idx].asset;
          }
        });
      }
    });

    setChartData(data);
    setAssetData(finalAssets);
  };

  // 處理滑桿變化
  const handleSliderChange = (prop, value) => {
    setInput((prev) => ({
      ...prev,
      [prop]: value,
    }));
  };

  // 處理文字輸入
  const handleTextChange = (type, value) => {
    const numValue = commasToNumber(value);
    if (type === "single") {
      setTextSingle(value);
      setInput((prev) => ({ ...prev, invMoney: numValue }));
    } else {
      setTextRegular(value);
      setInput((prev) => ({ ...prev, regMoney: numValue }));
    }
  };

  // 切換編輯模式
  const switchEditState = (type) => {
    setEdit((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // 驗證規則
  const validateLifeAge = (value) => {
    return value <= 120 - input.nowAge;
  };

  const validateRegularMoney = (value) => {
    return commasToNumber(value) >= 3500;
  };

  const validateSingleMoney = (value) => {
    return commasToNumber(value) >= 35000;
  };

  // 效果
  useEffect(() => {
    calculateInvestment();
  }, [input, switchSet]);

  useEffect(() => {
    setTextSingle(addCommas(input.invMoney));
  }, [input.invMoney]);

  useEffect(() => {
    setTextRegular(addCommas(input.regMoney));
  }, [input.regMoney]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: companyStyles.backgroundColor }}
    >
      <div
        className="container mx-auto px-4 py-8"
        style={{ color: companyStyles.textColor }}
      >
        {/* 風險等級 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">風險等級</h2>
          <div className="flex flex-wrap gap-2">
            {riskText.map((item) => (
              <button
                key={item.value}
                className={`px-6 py-4 rounded-lg text-lg font-medium transition-all duration-200 ${
                  input.kyc === item.value
                    ? `shadow-lg text-white`
                    : "bg-gray-100 opacity-40 hover:opacity-60"
                }`}
                style={{
                  backgroundColor:
                    input.kyc === item.value
                      ? companyStyles.barColor
                      : "#F7F2E8",
                  color:
                    input.kyc === item.value
                      ? "white"
                      : companyStyles.textColor,
                }}
                onClick={() => handleSliderChange("kyc", item.value)}
              >
                {item.text}
              </button>
            ))}
          </div>
        </section>

        {/* 目標設定 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">目標設定</h2>
          {goalOptions.map((option) => (
            <div key={option.prop} className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">{option.name}</span>
                <span className="text-lg">
                  <span className="font-bold">
                    {toThousand(input[option.prop])}
                  </span>
                  <span className="ml-2">{option.unit}</span>
                </span>
              </div>
              <input
                type="range"
                min={option.min}
                max={option.max}
                step={option.step}
                value={input[option.prop]}
                onChange={(e) =>
                  handleSliderChange(option.prop, parseInt(e.target.value))
                }
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${
                    companyStyles.barColor
                  } 0%, ${companyStyles.barColor} ${
                    ((input[option.prop] - option.min) /
                      (option.max - option.min)) *
                    100
                  }%, #e5e7eb ${
                    ((input[option.prop] - option.min) /
                      (option.max - option.min)) *
                    100
                  }%, #e5e7eb 100%)`,
                }}
              />
              {option.prop === "invYear" &&
                !validateLifeAge(input[option.prop]) && (
                  <p className="text-red-500 text-sm mt-1">
                    不得大於{120 - input.nowAge}年
                  </p>
                )}
            </div>
          ))}
        </section>

        {/* 投入金額 */}
        <section className="mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold mr-6">投入金額</h2>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={switchSet.single}
                  onChange={(e) =>
                    setSwitchSet((prev) => ({
                      ...prev,
                      single: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                單筆
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={switchSet.regular}
                  onChange={(e) =>
                    setSwitchSet((prev) => ({
                      ...prev,
                      regular: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                定期定額
              </label>
              {company === "JyuMei" && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={switchNTD}
                    onChange={(e) => setSwitchNTD(e.target.checked)}
                    className="mr-2"
                  />
                  顯示台幣
                </label>
              )}
            </div>
          </div>

          {!(switchSet.single || switchSet.regular) && (
            <div className="text-red-500 font-bold text-center mb-4">
              您必須選擇一項投入方式
            </div>
          )}

          {/* 單筆投入 */}
          {switchSet.single && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">
                  {investOptions[0].name}
                </span>
                <div className="flex items-center">
                  <span>{getPreffix()}</span>
                  {edit.single ? (
                    <input
                      type="text"
                      value={textSingle}
                      onChange={(e) =>
                        handleTextChange("single", e.target.value)
                      }
                      className="mx-2 px-3 py-1 border rounded text-center"
                      placeholder="請輸入金額"
                    />
                  ) : (
                    <span className="font-bold mx-2">
                      {toThousand(input.invMoney)}
                    </span>
                  )}
                  <span>{investOptions[0].unit}</span>
                  <button
                    onClick={() => switchEditState("single")}
                    className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    {edit.single ? "✓" : "✏️"}
                  </button>
                </div>
              </div>
              {!edit.single && (
                <>
                  <input
                    type="range"
                    min={investOptions[0].min}
                    max={investOptions[0].max}
                    step={investOptions[0].step}
                    value={input.invMoney}
                    onChange={(e) =>
                      handleSliderChange("invMoney", parseInt(e.target.value))
                    }
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${
                        companyStyles.barColor
                      } 0%, ${companyStyles.barColor} ${
                        ((input.invMoney - investOptions[0].min) /
                          (investOptions[0].max - investOptions[0].min)) *
                        100
                      }%, #e5e7eb ${
                        ((input.invMoney - investOptions[0].min) /
                          (investOptions[0].max - investOptions[0].min)) *
                        100
                      }%, #e5e7eb 100%)`,
                    }}
                  />
                  {!validateSingleMoney(input.invMoney) && (
                    <p className="text-red-500 text-sm mt-1">
                      單筆投入不得小於{getPreffix()} 35,000元
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* 定期定額 */}
          {switchSet.regular && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">
                  {investOptions[1].name}
                </span>
                <div className="flex items-center">
                  <span>{getPreffix()}</span>
                  {edit.regular ? (
                    <input
                      type="text"
                      value={textRegular}
                      onChange={(e) =>
                        handleTextChange("regular", e.target.value)
                      }
                      className="mx-2 px-3 py-1 border rounded text-center"
                      placeholder="請輸入金額"
                    />
                  ) : (
                    <span className="font-bold mx-2">
                      {toThousand(input.regMoney)}
                    </span>
                  )}
                  <span>{investOptions[1].unit}</span>
                  <button
                    onClick={() => switchEditState("regular")}
                    className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    {edit.regular ? "✓" : "✏️"}
                  </button>
                </div>
              </div>
              {!edit.regular && (
                <>
                  <input
                    type="range"
                    min={investOptions[1].min}
                    max={investOptions[1].max}
                    step={investOptions[1].step}
                    value={input.regMoney}
                    onChange={(e) =>
                      handleSliderChange("regMoney", parseInt(e.target.value))
                    }
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${
                        companyStyles.barColor
                      } 0%, ${companyStyles.barColor} ${
                        ((input.regMoney - investOptions[1].min) /
                          (investOptions[1].max - investOptions[1].min)) *
                        100
                      }%, #e5e7eb ${
                        ((input.regMoney - investOptions[1].min) /
                          (investOptions[1].max - investOptions[1].min)) *
                        100
                      }%, #e5e7eb 100%)`,
                    }}
                  />
                  {!validateRegularMoney(input.regMoney) && (
                    <p className="text-red-500 text-sm mt-1">
                      定期定額不得小於{getPreffix()} 3,500元
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        {/* 資產模擬 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">資產模擬</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `${getPreffix()} ${toThousand(value)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="better"
                  stroke="#FF7696"
                  name="較好情況"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="normal"
                  stroke="#FF9FB5"
                  name="一般情況"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="poor"
                  stroke="#FCBECA"
                  name="較差情況"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 投資結果 */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="mb-6 font-bold text-lg">
              投資時間到時，預估資產累積:
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-300 rounded-full mr-2"></span>
                <span className="text-sm">
                  市場較好情況下，您可能累積到：{getPreffix()}{" "}
                  {toThousand(Math.round(assetData[0] / 10000))}萬
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-pink-300 rounded-full mr-2"></span>
                <span className="text-sm">
                  市場一般情況下，您可能累積到：{getPreffix()}{" "}
                  {toThousand(Math.round(assetData[1] / 10000))}萬
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-pink-200 rounded-full mr-2"></span>
                <span className="text-sm">
                  市場較差情況下，您可能累積到：{getPreffix()}{" "}
                  {toThousand(Math.round(assetData[2] / 10000))}萬
                </span>
              </div>
            </div>
            <div className="mt-6 text-xs text-gray-600">
              <div>* 報酬率假設：</div>
              <div>
                較好情況為年化報酬率
                {(returnRates[input.kyc][0] * 100).toFixed(1)}%；
                一般情況為年化報酬率
                {(returnRates[input.kyc][1] * 100).toFixed(1)}%；
                較差情況為年化報酬率
                {(returnRates[input.kyc][2] * 100).toFixed(1)}%。
                每年提領金額以通膨率 2% 增加
              </div>
            </div>
          </div>
        </section>

        {/* 免責聲明 */}
        <section className="text-xs text-gray-600 px-4">
          <p className="mb-2">* 重要聲明：</p>
          <ul>
            {riskNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default WealthPlanCalculator;
