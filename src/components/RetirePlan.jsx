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
import { useRiskNotes } from "../context/useRiskNotes";

const RetirementCalculator = ({ type = "Golden" }) => {
  const [company] = useState(type);
  const [switchNTD, setSwitchNTD] = useState(false);
  const [switchSet, setSwitchSet] = useState({ single: true, regular: true });
  const [edit, setEdit] = useState({ single: false, regular: false });
  const [warning, setWarning] = useState(false);
  const [suggest, setSuggest] = useState([0, 0]);
  const [chartData, setChartData] = useState([]);
  const [text, setText] = useState([]);

  // 輸入參數初始值
  const [input, setInput] = useState({
    kyc: 1, // 風險等級
    nowAge: 30,
    retireAge: 65,
    lifeAge: 85,
    withdraw: 5000,
    invMoney: 100000, // 單筆投入
    regMoney: 10000, // 定期定額
    deposit: 50000, // 其他現金準備
  });

  const [textSingle, setTextSingle] = useState("100,000");
  const [textRegular, setTextRegular] = useState("10,000");

  // 風險告知
  const { riskNotes } = useRiskNotes();
  // 工具函數
  const toThousand = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const commasToNumber = (str) => {
    return parseInt(str.toString().replace(/,/g, "")) || 0;
  };

  const addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 貨幣前綴
  const preffix = switchNTD ? "NT$ " : "US$ ";

  // 風險屬性文字
  const riskText = [
    { value: 0, text: "保守型" },
    { value: 1, text: "穩健型" },
    { value: 2, text: "積極型" },
    { value: 3, text: "高風險型" },
  ];

  // 顏色配置
  const getCompanyColors = (company) => {
    const colors = {
      Golden: {
        background: "#f2eada",
        text: "black",
        thumb: "#cc9c50",
        notice: "#837151",
        riskBtn: "bg-yellow-600",
        bar: "#cc9c50",
      },
      ENOCH: {
        background: "#F7F8F7",
        text: "#074163",
        thumb: "#D35A23",
        notice: "#074163",
        riskBtn: "bg-blue-600",
        bar: "#074163",
      },
      JyuMei: {
        background: "#FFF7F7",
        text: "#393939",
        thumb: "#BE0000",
        notice: "#BE0000",
        riskBtn: "bg-red-600",
        bar: "#BE0000",
      },
    };
    return colors[company] || colors.Golden;
  };

  const colors = getCompanyColors(company);

  // 固定參數
  const constant = {
    Rinvest: [
      [0.08, 0.06, 0.04], // 保守型
      [0.1, 0.08, 0.06], // 穩健型
      [0.12, 0.1, 0.08], // 積極型
      [0.15, 0.12, 0.09], // 高風險型
    ],
    inflation: 0.02,
    depositRate: 0.015,
  };

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
      max: 20000,
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
      max: 100000000,
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
    {
      name: "其他現金準備",
      prop: "deposit",
      max: 1000000,
      min: 0,
      unit: "元",
      step: 10000,
    },
  ];

  // 資產計算函數
  const calculateAsset = () => {
    const yearsToRetire = input.retireAge - input.nowAge;
    const yearsAfterRetire = input.lifeAge - input.retireAge;
    const monthlyInvest = switchSet.regular ? input.regMoney : 0;
    const lumpSum = switchSet.single ? input.invMoney : 0;

    const scenarios = ["better", "normal", "poor"];
    const results = {};

    scenarios.forEach((scenario, index) => {
      const rate = constant.Rinvest[input.kyc][index];
      const monthlyRate = rate / 12;

      // 計算退休前資產累積
      let asset = lumpSum;
      const yearlyData = [];

      for (let year = 0; year <= yearsToRetire; year++) {
        if (year > 0) {
          asset = asset * (1 + rate) + monthlyInvest * 12 * (1 + rate);
        }
        yearlyData.push({
          year: input.nowAge + year,
          asset: asset + input.deposit,
        });
      }

      results[scenario] = yearlyData;
    });

    return results;
  };

  // 生成圖表數據
  const generateChartData = () => {
    const assetData = calculateAsset();
    const yearsToRetire = input.retireAge - input.nowAge;
    const data = [];

    for (let i = 0; i <= yearsToRetire; i++) {
      data.push({
        age: input.nowAge + i,
        better: Math.round(assetData.better[i].asset / 10000),
        normal: Math.round(assetData.normal[i].asset / 10000),
        poor: Math.round(assetData.poor[i].asset / 10000),
      });
    }

    return data;
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
    const errors = [];
    if (input.nowAge >= input.retireAge)
      errors.push("現在年齡不得大於退休年齡");
    if (input.lifeAge <= input.retireAge)
      errors.push("預期壽命不得小於退休年齡");
    if (switchSet.regular && input.regMoney < 3500)
      errors.push("定期定額不得小於3,500元");
    if (switchSet.single && input.invMoney < 35000)
      errors.push("單筆投入不得小於35,000元");
    return errors;
  };

  // 更新計算
  const updateCalculation = () => {
    const data = generateChartData();
    setChartData(data);

    // 更新文字顯示
    const retireData = data[data.length - 1];
    setText([
      [
        "#438B41",
        `市場較好情況下，您可能累積到：${preffix} ${toThousand(
          retireData.better
        )}萬`,
      ],
      [
        "#6BB169",
        `市場一般情況下，您可能累積到：${preffix} ${toThousand(
          retireData.normal
        )}萬`,
      ],
      [
        "#A6C7A5",
        `市場較差情況下，您可能累積到：${preffix} ${toThousand(
          retireData.poor
        )}萬`,
      ],
    ]);

    // 檢查是否需要警告
    const totalWithdraw =
      input.withdraw * 12 * (input.lifeAge - input.retireAge);
    const normalAsset = retireData.normal * 10000;
    setWarning(normalAsset < totalWithdraw);

    if (normalAsset < totalWithdraw) {
      const deficit = totalWithdraw - normalAsset;
      setSuggest([
        toThousand(Math.round(deficit * 0.8)),
        toThousand(Math.round((deficit * 0.2) / 12)),
      ]);
    }
  };

  // 自定義滑桿組件
  const CustomSlider = ({ value, onChange, min, max, step, color }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="relative w-full h-3 bg-gray-200 rounded-full">
        <div
          className="absolute h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-6 h-6 bg-white border-4 rounded-full transform -translate-y-1/2 -translate-x-1/2 cursor-pointer"
          style={{
            left: `${percentage}%`,
            top: "50%",
            borderColor: color,
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    console.log(riskNotes);
  }, []);

  useEffect(() => {
    updateCalculation();
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
        {/* 風險等級 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">風險等級</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {riskText.map((item, index) => (
              <button
                key={index}
                className={`p-4 rounded-lg text-lg font-medium transition-all ${
                  input.kyc === item.value
                    ? `${colors.riskBtn} text-white shadow-lg`
                    : "bg-gray-100 opacity-60 hover:opacity-80"
                }`}
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
          {goalOptions.map((option, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{option.name}</span>
                <span className="font-bold">
                  {option.prop === "withdraw" && preffix}
                  {toThousand(input[option.prop])} {option.unit}
                </span>
              </div>
              <CustomSlider
                value={input[option.prop]}
                onChange={(value) => handleSliderChange(option.prop, value)}
                min={option.min}
                max={option.max}
                step={option.step}
                color={colors.bar}
              />
            </div>
          ))}
        </section>

        {/* 投入金額 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
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
            <div className="text-red-500 text-center font-bold mb-6">
              您必須選擇一項投入方式
            </div>
          )}

          {/* 單筆投入 */}
          {switchSet.single && (
            <div className="mb-6">
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
                  value={input.invMoney}
                  onChange={(value) => handleSliderChange("invMoney", value)}
                  min={investOptions[0].min}
                  max={investOptions[0].max}
                  step={investOptions[0].step}
                  color={colors.bar}
                />
              )}
            </div>
          )}

          {/* 定期定額 */}
          {switchSet.regular && (
            <div className="mb-6">
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
                  value={input.regMoney}
                  onChange={(value) => handleSliderChange("regMoney", value)}
                  min={investOptions[1].min}
                  max={investOptions[1].max}
                  step={investOptions[1].step}
                  color={colors.bar}
                />
              )}
            </div>
          )}

          {/* 其他現金準備 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">其他現金準備</span>
              <span className="font-bold">
                {preffix}
                {toThousand(input.deposit)} 元
              </span>
            </div>
            <CustomSlider
              value={input.deposit}
              onChange={(value) => handleSliderChange("deposit", value)}
              min={investOptions[2].min}
              max={investOptions[2].max}
              step={investOptions[2].step}
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
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${preffix}${toThousand(value)}萬`,
                    "",
                  ]}
                  labelFormatter={(age) => `年齡: ${age}歲`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="better"
                  stroke="#438B41"
                  name="較好情況"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="normal"
                  stroke="#6BB169"
                  name="一般情況"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="poor"
                  stroke="#A6C7A5"
                  name="較差情況"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
            <div className="font-bold mb-4">退休時，預估退休金:</div>
            <div className="flex flex-wrap gap-4 mb-4">
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
              <div>
                較好情況為年化報酬率
                {(constant.Rinvest[input.kyc][0] * 100).toFixed(1)}%；
                一般情況為年化報酬率
                {(constant.Rinvest[input.kyc][1] * 100).toFixed(1)}%；
                較差情況為年化報酬率
                {(constant.Rinvest[input.kyc][2] * 100).toFixed(1)}%。
                每年提領金額以通膨率 2% 增加
              </div>
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
        <div className="text-xs text-gray-500 mt-8">
          <div>* 重要聲明：</div>
          <div>
            投資人因不同時間進場，將有不同之投資績效，過去之績效亦不代表未來績效之保證。以過去績效進行模擬投資組合之報酬率時，僅為歷史資料模擬投資組合之結果，不代表本投資組合之實際報酬率及未來績效保證，不同時間進行模擬操作，結果可能不同。
          </div>
          <div>
            阿爾發投顧自當盡力提供正確資訊，所載資料均來自或本諸我們相信可靠之來源，但對其完整性、即時性和正確性不做任何擔保，如有錯漏或疏忽，本公司或關係企業與其任何董事或受僱人等，對此不負任何法律責任。模擬之結果僅供參考，無法保證準確性，未來實際狀況可能與模擬數值有所落差。
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;
