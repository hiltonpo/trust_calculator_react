import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  Scatter,
  ResponsiveContainer,
} from "recharts";
import { Edit, Check } from "lucide-react";
import {
  riskText,
  retireInput,
  retireConstant,
  situation,
  chartDataCalculation,
  optimalSolution,
} from "../utilty/Formula";
import RiskNoticeComponent from "./RiskNotice";
import RiskForKYCComponent from "./RiskForKYC";
import CustomSlider from "./CustomSlider";
import CommonContext from "../context/CommonContext";

const RetirementCalculator = ({ utils }) => {
  const [switchNTD, setSwitchNTD] = useState(false);
  const [switchSet, setSwitchSet] = useState({ single: true, regular: true });
  const [edit, setEdit] = useState({ single: false, regular: false });
  const [warning, setWarning] = useState(false);
  const [suggest, setSuggest] = useState([0, 0]);
  const [chartData, setChartData] = useState([]);
  const [withdrawData, setWithdrawData] = useState([]);
  const [assetData, setAssetData] = useState([0, 0, 0]);
  const [text, setText] = useState([]);
  const [errors, setErrors] = useState([]);

  // 輸入參數初始值
  const [input, setInput] = useState(retireInput);

  const [textSingle, setTextSingle] = useState("100,000");
  const [textRegular, setTextRegular] = useState("10,000");

  // 工具函數
  const { toThousand, addCommas, commasToNumber } = utils;

  // 貨幣前綴
  const preffix = switchNTD ? "NT$ " : "US$ ";

  // 顏色配置
  const { colors } = React.useContext(CommonContext);

  // 目標設定選項
  const goalOptions = [
    { name: "現在年齡", prop: "nowAge", max: 120, min: 0, unit: "歲", step: 1 },
    {
      name: "退休年齡",
      prop: "retireAge",
      max: 120,
      min: 0,
      unit: "歲",
      step: 1,
    },
    {
      name: "預期壽命",
      prop: "lifeAge",
      max: 120,
      min: 0,
      unit: "歲",
      step: 1,
    },
    {
      name: "退休後每月提領金額",
      prop: "withdraw",
      max: 10000,
      min: 0,
      unit: "元",
      step: 100,
    },
  ];

  // 投入金額選項
  const investOptions = [
    {
      name: "單筆投入金額",
      prop: "invMoney",
      max: 1000000,
      min: 1000,
      unit: "元",
      step: 1000,
    },
    {
      name: "定期定額投入金額",
      prop: "regMoney",
      max: 10000,
      min: 100,
      unit: "元",
      step: 100,
    },
    {
      name: "其他現金準備",
      prop: "deposit",
      max: 1000000,
      min: 0,
      unit: "元",
      step: 10000,
    },
  ];

  // 生成圖表數據
  const generateChartData = () => {
    // 退休年齡不可小於現在年齡 或 預期壽命不可小於退休年齡
    if (input.retireAge <= input.nowAge || input.lifeAge <= input.retireAge)
      return;
    const [
      XLineData,
      YLineData,
      beforeRetireAssetData,
      afterRetireAssetData,
      withdrawAll,
      chartData,
    ] = chartDataCalculation(input, situation("retire"), retireConstant);

    const withdrawData = [input.retireAge, withdrawAll];
    const assetData = ["better", "normal", "poor"].reduce((acc, situation) => {
      acc.push([input.retireAge, beforeRetireAssetData[situation].at(-1)]);
      return acc;
    }, []);

    const refineChartData = chartData.map((item) => {
      const age = item.age;
      if (age === withdrawData[0]) {
        item.withdrawAll = withdrawData[1];
      }
      return item;
    });

    setChartData(refineChartData);
    setWithdrawData(withdrawData);
    setAssetData(assetData);

    // 更新文字顯示
    const { better, normal, poor } = afterRetireAssetData;
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

    const [warning, suggest] = optimalSolution(
      withdrawAll,
      YLineData.normal[input.retireAge - input.nowAge],
      input.retireAge - input.nowAge
    )(retireConstant, input);
    // 檢查是否需要警告
    setWarning(warning);
    setSuggest(suggest);
  };

  // 切換編輯狀態
  const switchEditState = (type) => {
    setEdit((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // 處理滑桿變更
  const handleSliderChange = (prop, value) => {
    setInput((prev) => ({
      ...prev,
      [prop]: value,
    }));
  };

  // 處理文字輸入
  const handleTextChange = (type, value) => {
    if (type === "single") {
      setTextSingle(value);
      setInput((prev) => ({
        ...prev,
        invMoney: commasToNumber(value),
      }));
    } else {
      setTextRegular(value);
      setInput((prev) => ({
        ...prev,
        regMoney: commasToNumber(value),
      }));
    }
  };

  // 驗證規則
  const validateInput = () => {
    let errors = [];
    if (input.retireAge <= input.nowAge) {
      errors.push("退休年齡必須大於現在年齡");
    }
    if (input.lifeAge <= input.retireAge) {
      errors.push("預期壽命必須大於退休年齡");
    }
    setErrors(errors);
  };

  useEffect(() => {
    generateChartData();
    validateInput();
  }, [input, switchSet, switchNTD]);

  useEffect(() => {
    setTextSingle(addCommas(input.invMoney));
    setTextRegular(addCommas(input.regMoney));
  }, [input.invMoney, input.regMoney]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="container mx-auto px-4 py-8"
        style={{ color: colors.text }}
      >
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
          {goalOptions.map((option, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{option.name}</span>
                <span className="font-bold">
                  {option.prop === "withdraw" && preffix}
                  {toThousand(input[option.prop])} {option.unit}
                </span>
              </div>
              <CustomSlider
                min={option.min}
                max={option.max}
                step={option.step}
                value={input[option.prop]}
                onChange={(value) => {
                  handleSliderChange(option.prop, value);
                }}
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
            <div className="text-red-500 text-center font-bold mb-6">
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
                  {!edit.single ? (
                    <span className="font-bold">
                      {toThousand(input.invMoney)}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={textSingle}
                      onChange={(e) =>
                        handleTextChange("single", e.target.value)
                      }
                      className="w-32 p-2 border rounded text-center"
                      placeholder="請輸入金額"
                    />
                  )}
                  <span>元</span>
                  <button
                    onClick={() => switchEditState("single")}
                    className="p-1 bg-white rounded shadow"
                  >
                    {edit.single ? <Check size={16} /> : <Edit size={16} />}
                  </button>
                </div>
              </div>
              {!edit.single && (
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
                  {!edit.regular ? (
                    <span className="font-bold">
                      {toThousand(input.regMoney)}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={textRegular}
                      onChange={(e) =>
                        handleTextChange("regular", e.target.value)
                      }
                      className="w-32 p-2 border rounded text-center"
                      placeholder="請輸入金額"
                    />
                  )}
                  <span>元</span>
                  <button
                    onClick={() => switchEditState("regular")}
                    className="p-1 bg-white rounded shadow"
                  >
                    {edit.regular ? <Check size={16} /> : <Edit size={16} />}
                  </button>
                </div>
              </div>
              {!edit.regular && (
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
              )}
            </div>
          )}

          {/* 其他現金準備 */}
          <div className="mb-3 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">其他現金準備</span>
              <span>
                {preffix}
                <span className="font-bold">
                  {toThousand(input.deposit)}
                </span>{" "}
                元
              </span>
            </div>
            <CustomSlider
              min={investOptions[2].min}
              max={investOptions[2].max}
              step={investOptions[2].step}
              value={input.deposit}
              onChange={(value) => handleSliderChange("deposit", value)}
              color={colors.bar}
            />
          </div>

          <div className="text-xs text-gray-500 mb-8">
            <div>* 其他現金準備：</div>
            <p>
              包含現在手上的閒置資金，以及退休時所領到的勞保、勞退等退休金。『其他現金準備』此筆資金，會涵蓋在資產累積模擬圖中，但不考慮其複利增值效果，僅以現金計算。
            </p>
          </div>
        </section>

        {/* 資產模擬 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">資產模擬</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 10000) {
                      return `${(value / 10000).toFixed(1)}萬`;
                    } else {
                      return `${toThousand(value)}`;
                    }
                  }}
                  width={70}
                />
                <Tooltip
                  formatter={(value, name, item) => {
                    console.log(item);
                    if (
                      item.payload.age === 65 &&
                      ["較好情況", "一般情況", "較差情況"].includes(item.name)
                    ) {
                      item.color = "blue";
                    }
                    console.log(value);
                    return [`${preffix}${(value / 10000).toFixed(1)}萬`, name];
                  }}
                  labelFormatter={(age) => `年齡: ${age}歲`}
                  itemSorter={(a, b) => {
                    return a - b;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="better"
                  nameKey="better"
                  stroke="#438B41"
                  name="較好情況"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="normal"
                  nameKey="normal"
                  stroke="#6BB169"
                  name="一般情況"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="poor"
                  nameKey="poor"
                  stroke="#A6C7A5"
                  name="較差情況"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="withdrawAll"
                  nameKey="withdrawAll"
                  stroke="red"
                  name="*提領總額"
                  strokeWidth={2}
                />
                {assetData.map((array, index) => (
                  <ReferenceDot
                    key={`dot-${index}`}
                    x={array[0]}
                    y={array[1]}
                    r={6}
                    fill="blue"
                    stroke="none"
                  />
                ))}
                <ReferenceDot
                  x={withdrawData[0]}
                  y={withdrawData[1]}
                  r={6}
                  fill="red"
                  label={{ value: "提領總額", position: "top" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
            <div className="font-bold mb-4">退休時，預估退休金:</div>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {text.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item[0] }}
                  />
                  <span className="text-sm">{item[1]}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              <div>* 報酬率假設：</div>
              {["較好", "一般", "較差"].map((situation, index) => {
                return (
                  <div key={index}>
                    {situation}情況為年化報酬率
                    {(retireConstant.Rinvest[input.kyc][index] * 100).toFixed(
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

        {/* 參數建議 */}
        {warning && (
          <>
            <div
              className="text-center font-bold mb-8"
              style={{ color: colors.thumb }}
            >
              <div>距離您需要的退休金還有一點點距離</div>
              <div>請參考以下建議調整參數，提高達成機率！</div>
            </div>
            <div
              className="text-white p-8 rounded-lg"
              style={{ backgroundColor: colors.notice }}
            >
              <div className="flex items-center justify-center mb-4">
                <span className="text-yellow-300 mr-2">★</span>
                <span className="text-xl">參數建議</span>
                <span className="ml-4 text-sm">(以下金額二擇一調整)</span>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div>
                  <div>單筆投資提高至：</div>
                  <div>定期定額提高至：</div>
                </div>
                <div>
                  <div>
                    約{preffix} {suggest[0]} 元
                  </div>
                  <div>
                    約{preffix} {suggest[1]} 元
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 免責聲明 */}
        <RiskNoticeComponent />
      </div>
    </div>
  );
};

export default RetirementCalculator;
