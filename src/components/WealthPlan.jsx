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
import { Edit, Check } from "lucide-react";
import {
  riskText,
  wealthInput,
  wealthConstant,
  situation,
  chartDataCalculation_Aum,
} from "../utilty/Formula";
import RiskNoticeComponent from "./RiskNotice";
import RiskForKYCComponent from "./RiskForKYC";
import CustomSlider from "./CustomSlider";
import CommonContext from "../context/CommonContext";

export const WealthPlanCalculator = ({ utils }) => {
  const [input, setInput] = useState(wealthInput);

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
  const [text, setText] = useState([]);
  const [errors, setErrors] = useState([]);

  // 工具函數
  const { toThousand, addCommas, commasToNumber } = utils;

  // 顏色配置
  const { colors } = React.useContext(CommonContext);

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
  const returnRates = [
    [0.03, 0.02, 0.01], // 保守型
    [0.06, 0.04, 0.02], // 穩健型
    [0.09, 0.06, 0.03], // 積極型
    [0.12, 0.08, 0.04], // 進取型
  ];

  // 貨幣前綴
  const preffix = switchNTD ? "NT$ " : "US$ ";

  // 計算投資結果
  const calculateInvestment = () => {
    const [XLineData, YLineData, AssetAumData] = chartDataCalculation_Aum(
      input,
      situation("wealth"),
      wealthConstant
    );
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

    // 更新文字顯示
    const { better, normal, poor } = AssetAumData;
    setText([
      [
        "#438B41",
        `市場較好情況下，您可能累積到：${preffix} ${(better[0] / 10000).toFixed(
          1
        )}萬`,
      ],
      [
        "#6BB169",
        `市場一般情況下，您可能累積到：${preffix} ${(normal[0] / 10000).toFixed(
          1
        )}萬`,
      ],
      [
        "#A6C7A5",
        `市場較差情況下，您可能累積到：${preffix} ${(poor[0] / 10000).toFixed(
          1
        )}萬`,
      ],
    ]);
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
  const validateInput = () => {
    let errors = [];
    if (input.nowAge + input.invYear > 90) {
      errors.push("現在年齡加上投資期間不可超過90歲");
    }
    setErrors(errors);
  };

  // 效果
  useEffect(() => {
    calculateInvestment();
    validateInput();
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
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="container mx-auto px-4 py-8"
        style={{ color: colors.text }}
      >
        {/* 風險等級 */}
        <RiskForKYCComponent
          input={input}
          colors={colors}
          riskText={riskText}
          handleChange={handleSliderChange}
        ></RiskForKYCComponent>

        {/* 目標設定 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">目標設定</h2>
          {errors.length > 0 && (
            <ul className="text-red-600 font-bold text-sm space-y-1">
              {errors.map((err, index) => (
                <li key={index}>• {err}</li>
              ))}
            </ul>
          )}
          {goalOptions.map((option) => (
            <div key={option.prop} className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">{option.name}</span>
                <span className="text-lg">
                  <span className="font-bold">
                    {toThousand(input[option.prop])}
                  </span>
                  <span className="ml-2">{option.unit}</span>
                </span>
              </div>
              <CustomSlider
                min={option.min}
                max={option.max}
                step={option.step}
                value={input[option.prop]}
                onChange={(value) => handleSliderChange(option.prop, value)}
                color={colors.bar}
              />
            </div>
          ))}
        </section>

        {/* 投入金額 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">投入金額</h2>
            <div className="flex gap-4">
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={switchNTD}
                  onChange={(e) => setSwitchNTD(e.target.checked)}
                  className="mr-2"
                />
                顯示台幣
              </label>
            </div>
          </div>

          {!(switchSet.single || switchSet.regular) && (
            <div className="text-red-500 font-bold text-center mb-4">
              您必須選擇一項投入方式
            </div>
          )}

          {/* 單筆投入 */}
          {switchSet.single && (
            <div className="mb-3 p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">單筆投入金額</span>
                <div className="flex items-center gap-2">
                  <span>{preffix}</span>
                  {edit.single ? (
                    <input
                      type="text"
                      value={textSingle}
                      onChange={(e) =>
                        handleTextChange("single", e.target.value)
                      }
                      className="w-32 p-2 border rounded text-center"
                      placeholder="請輸入金額"
                    />
                  ) : (
                    <span className="font-bold">
                      {toThousand(input.invMoney)}
                    </span>
                  )}
                  <span>{investOptions[0].unit}</span>
                  <button
                    onClick={() => switchEditState("single")}
                    className="p-1 bg-white rounded shadow"
                  >
                    {edit.single ? <Check size={16} /> : <Edit size={16} />}
                  </button>
                </div>
              </div>
              {!edit.single && (
                <>
                  <CustomSlider
                    min={investOptions[0].min}
                    max={investOptions[0].max}
                    step={investOptions[0].step}
                    value={input.invMoney}
                    onChange={(value) => {
                      handleSliderChange("invMoney", value);
                    }}
                    color={colors.bar}
                  />
                </>
              )}
            </div>
          )}

          {/* 定期定額 */}
          {switchSet.regular && (
            <div className="mb-3 p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">定期定額投入金額</span>
                <div className="flex items-center gap-2">
                  <span>{preffix}</span>
                  {edit.regular ? (
                    <input
                      type="text"
                      value={textRegular}
                      onChange={(e) =>
                        handleTextChange("regular", e.target.value)
                      }
                      className="px-3 py-1 border rounded text-center"
                      placeholder="請輸入金額"
                    />
                  ) : (
                    <span className="font-bold">
                      {toThousand(input.regMoney)}
                    </span>
                  )}
                  <span>{investOptions[1].unit}</span>
                  <button
                    onClick={() => switchEditState("single")}
                    className="p-1 bg-white rounded shadow"
                  >
                    {edit.single ? <Check size={16} /> : <Edit size={16} />}
                  </button>
                </div>
              </div>
              {!edit.regular && (
                <>
                  <CustomSlider
                    min={investOptions[1].min}
                    max={investOptions[1].max}
                    step={investOptions[1].step}
                    value={input.regMoney}
                    onChange={(value) => {
                      handleSliderChange("regMoney", value);
                    }}
                    color={colors.bar}
                  />
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
                  formatter={(value) => `${preffix} ${toThousand(value)}`}
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
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-300 rounded-full mr-2"></span>
                <span className="text-sm">
                  市場較好情況下，您可能累積到：{preffix}{" "}
                  {toThousand(Math.round(assetData[0] / 10000))}萬
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-pink-300 rounded-full mr-2"></span>
                <span className="text-sm">
                  市場一般情況下，您可能累積到：{preffix}{" "}
                  {toThousand(Math.round(assetData[1] / 10000))}萬
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-pink-200 rounded-full mr-2"></span>
                <span className="text-sm">
                  市場較差情況下，您可能累積到：{preffix}{" "}
                  {toThousand(Math.round(assetData[2] / 10000))}萬
                </span>
              </div>
            </div>
            <div className="mt-6 text-xs text-gray-600">
              <div>* 報酬率假設：</div>
              {["較好", "一般", "較差"].map((situation, index) => {
                return (
                  <div key={index}>
                    {situation}情況為年化報酬率
                    {(wealthConstant.Rinvest[input.kyc][index] * 100).toFixed(
                      1
                    )}
                    %。
                  </div>
                );
              })}
              <div>每年提領金額以通膨率 2% 增加</div>
            </div>
          </div>
        </section>

        {/* 免責聲明 */}
        <RiskNoticeComponent />
      </div>
    </div>
  );
};

export default WealthPlanCalculator;
