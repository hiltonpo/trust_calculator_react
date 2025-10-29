// import * as echarts from "echarts/core";
import { toThousand } from "../utility/Utility";

export const suffix = {
  year: "年",
  old: "歲",
  everyMonth: "/每月",
  everyYear: "/每年",
  percentage: "%",
};

// 風險屬性
export const riskText = [
  {
    text: "保守型",
    value: 0,
  },
  {
    text: "穩健型",
    value: 1,
  },
  {
    text: "成長型",
    value: 2,
  },
  {
    text: "積極型",
    value: 3,
  },
];

export const situation = (type) => {
  if (type === "retire") {
    return ["better", "normal", "poor", "withdraw"];
  } else if (type === "wealth") {
    return ["better", "normal", "poor"];
  }
};

// 退休計畫固定參數 三種投資報酬率(較好、一般、較差)、通膨率、定存利率
export const retireConstant = {
  Rinvest: [
    [0.021, 0.013, 0.005], // 保守
    [0.064, 0.049, 0.034], // 穩健
    [0.083, 0.065, 0.047], // 成長
    [0.103, 0.083, 0.063], // 積極
  ],
  Rinflation: 0.02,
  Rdeposit: 0,
};

// 退休計畫輸入參數 (給予初始預設值): 風險等級、年齡區間、預期壽命、單筆投入、定期定額、其他退休準備(定存)、退休後每月提領金額
export const retireInput = {
  kyc: 1, // 風險等級
  nowAge: 35,
  retireAge: 65,
  lifeAge: 90,
  invMoney: 100000, // 單筆投入 元
  regMoney: 5000, //  定期定額 元
  deposit: 10000, // 其他現金準備 元
  withdraw: 1000, // 退休後每月提領金額 元
};

// 累積財富計畫固定參數 三種投資報酬率(較好、一般、較差)
export const wealthConstant = {
  Rinvest: retireConstant.Rinvest,
};

// 累積財富輸入參數 (給予初始預設值): 風險等級、現在年齡、預計投資期間、單筆投入、定期定額
export const wealthInput = {
  kyc: 1,
  nowAge: 30,
  invYear: 30,
  invMoney: 100000, // 萬
  regMoney: 5000, // 元
};

/** *****************************************  For 退休計畫  ****************************************/
//  退休前資產累積  (year為投資第幾年、r為投報率=>好、普通、差)
function assetBeforeRetire(input, constant) {
  return (year, r) => {
    const depositRatio = 1 + constant.Rdeposit; // 總定存投報率
    const investRatio = 1 + r; // 總投資投報率
    const totalDeposit = (t) => {
      // 累積定存資產
      return input.deposit * depositRatio ** year;
    };
    const recrusionAssetBefore = (year, r) => {
      // 累積投資資產
      const inital = input.invMoney; // 初始單筆金額
      const totalRegMoney = input.regMoney * 12; // 每年定期總額
      const total = (inital + totalRegMoney) * investRatio; // 當年度投資資產 = (初始單筆金額+每年定期累積金額)X年化報酬率
      if (year === 0) {
        return inital;
      } else if (year === 1) {
        return total;
      } else {
        return (
          (recrusionAssetBefore(year - 1, r) + totalRegMoney) * investRatio
        );
      }
    };

    return Math.round(recrusionAssetBefore(year, r) + totalDeposit(year)); // 退休前資產累積 = 累積定存資產 + 累積投資資產
  };
}

//  退休後資產累積  (year為退休第幾年、r為投報率=>好、普通、差)
function assetAfterRetire(input, constant) {
  return (year, r) => {
    const depositRatio = 1 + constant.Rdeposit; // 總定存投報率
    const inflationRatio = 1 + constant.Rinflation; // 總通膨投報率
    const investRatio = 1 + r; // 總投資投報率
    const investYear = input.retireAge - input.nowAge; // 投資年數
    const assetB4Retire = assetBeforeRetire(input, constant)(investYear, r); // 退休前累積資產

    // 總加權報酬率(退休後使用的報酬率) = 1 + (累積投資資產 X 總投資投報率 + 累積定存資產 X 總定存投報率) / 總累積資產
    const avgRatio =
      1 +
      (assetB4Retire * r -
        input.deposit * depositRatio ** investYear * investRatio +
        input.deposit * depositRatio ** investYear * depositRatio) /
        assetB4Retire;

    const recrusionAssetAfter = (year, r) => {
      const inital = assetBeforeRetire(input, constant)(investYear, r); // 初始退休累積資產
      const totalRegWithdraw = (t) => {
        // 每年提領金額(考慮每年通膨)
        return input.withdraw * 12 * inflationRatio ** t;
      };
      const total = (inital - totalRegWithdraw(0)) * avgRatio; // 當年度投資資產 = (初始單筆金額retu+每年定期累積金額)X年化報酬率
      if (year < 2) {
        return total;
      } else {
        return (
          (recrusionAssetAfter(year - 1, r) - totalRegWithdraw(year - 1)) *
          avgRatio
        ); // 提領後資產累積
      }
    };
    return recrusionAssetAfter(year, r) <= 0
      ? 0
      : Math.round(recrusionAssetAfter(year, r));
  };
}

// 最佳解建議參數：假如總提領金額 > 退休前累積資產(市場一般情況)，則計算單筆 或 定期定額 所需要調整的金額大小
export function optimalSolution(withdrawAll, assetBeforeRetire, year) {
  return (constant, input) => {
    const depositRatio = 1 + constant.Rdeposit; // 總定存投報率
    const investRatio = 1 + constant.Rinvest[input.kyc][1]; // 總投資投報率
    const totalDeposit = (t) => {
      // 累積定存資產
      return input.deposit * depositRatio ** t;
    };
    if (withdrawAll > assetBeforeRetire) {
      // 只調整單筆金額大小，定期定額設為常數
      const deltaInv = () => {
        return (
          (withdrawAll -
            (totalDeposit(year) +
              (12 *
                input.regMoney *
                (investRatio ** (year + 1) - investRatio)) /
                (investRatio - 1))) /
          investRatio ** year
        );
      };
      // 只調整定期定額金額大小，單筆設為常數
      const deltaReg = () => {
        return (
          ((withdrawAll -
            (totalDeposit(year) + input.invMoney * investRatio ** year)) *
            (investRatio - 1)) /
          (12 * (investRatio ** (year + 1) - investRatio))
        );
      };

      return [
        true,
        [
          toThousand(Math.round(Number(deltaInv() / 1000)) * 1000),
          toThousand(Math.round(Number(deltaReg() / 1000)) * 1000),
        ],
      ];
    }

    return [false, []];
  };
}

// 計算X軸資料、Y軸資料、退休前累積資產array、退休後累積資產array、總提領金額
export function chartDataCalculation(input, situation, constant) {
  // X軸資料(array)： 現在年齡 至 預期壽命
  const XLineData = new Array(input.lifeAge - input.nowAge + 1)
    .fill(0)
    .map((item, index) => input.nowAge + index);
  // Y軸資料(array)： 退休前資產累積 至 退休後資產累積 (分成 較好投報率、正常投報率、較差投報率 三條折線)
  const YLineData = {};

  // X軸資料分成兩段： 現在年齡 至 退休年齡(含) & 退休年齡+1 至 預期壽命
  const beforeRetireAgeData = new Array(input.retireAge - input.nowAge + 1)
    .fill(0)
    .map((item, index) => index);
  const afterRetireAgeData = new Array(input.lifeAge - input.retireAge)
    .fill(0)
    .map((item, index) => index + 1);

  // 退休前累積資產(array)： 分成 較好投報率、正常投報率、較差投報率 三條折線
  const beforeRetireAssetData = situation.reduce((all, cur, Rindex) => {
    all[cur] = beforeRetireAgeData.map((year, index) => {
      return assetBeforeRetire(input, constant)(
        year,
        constant.Rinvest[input.kyc][Rindex]
      );
    });
    return all;
  }, {});
  // 退休後累積資產(array)： 分成 較好投報率、正常投報率、較差投報率三條折線
  const afterRetireAssetData = situation.reduce((all, cur, Rindex) => {
    all[cur] = afterRetireAgeData.map((year, index) => {
      return assetAfterRetire(input, constant)(
        year,
        constant.Rinvest[input.kyc][Rindex]
      );
    });
    return all;
  }, {});

  // 預計提領總金額
  const withdrawAll = afterRetireAgeData.reduce((all, cur) => {
    return Math.round(
      all + input.withdraw * 12 * (1 + constant.Rinflation) ** cur
    );
  }, 0);

  // 將 退休前+退休後累積資產(三種報酬率)、提領金額 塞進Y軸資料
  (function fillDataToYLine(situation, arrayFillBefore, arrayFillAfter) {
    for (const item of situation) {
      if (item !== "withdraw") {
        YLineData[item] = beforeRetireAssetData[item].concat(
          afterRetireAssetData[item]
        );
      } else {
        // Y軸座標起始(0)->最高點(提領總額)->終點(0)
        YLineData[item] = [
          0,
          ...arrayFillBefore,
          withdrawAll,
          ...arrayFillAfter,
          0,
        ];
      }
    }
  })(
    situation,
    new Array(beforeRetireAgeData.length - 2).fill(""),
    new Array(afterRetireAgeData.length - 1).fill("")
  );

  const chartData = XLineData.map((age, index) => ({
    age: age,
    better: YLineData.better[index],
    normal: YLineData.normal[index],
    poor: YLineData.poor[index],
  }));

  return [
    XLineData,
    YLineData,
    beforeRetireAssetData,
    afterRetireAssetData,
    withdrawAll,
    chartData,
  ];
}

/** *****************************************  For 財富累積計畫  ****************************************/
// 累積資產 (year為退休第幾年、r為投報率=>好、普通、差)
function asset_Aum(input, constant) {
  return (year, r) => {
    const investRatio = 1 + r; // 總投資投報率
    const recrusionAsset_Aum = (year, r) => {
      // 累積投資資產
      const inital = input.invMoney; // 初始單筆金額
      const totalRegMoney = input.regMoney * 12; // 每年定期總額
      const total = (inital + totalRegMoney) * investRatio; // 當年度投資資產 = (初始單筆金額+每年定期累積金額)X年化報酬率
      if (year === 0) {
        return inital;
      } else if (year === 1) {
        return total;
      } else {
        return (recrusionAsset_Aum(year - 1, r) + totalRegMoney) * investRatio;
      }
    };
    return Math.round(recrusionAsset_Aum(year, r)); // 退休前資產累積 = 累積定存資產 + 累積投資資產
  };
}

// 計算X軸資料、Y軸資料
export function chartDataCalculation_Aum(input, situation, constant) {
  // X軸資料(array)： 現在年齡 至 現在年齡+投資期間
  const XLineData = new Array(input.invYear + 1)
    .fill(0)
    .map((item, index) => input.nowAge + index);
  // Y軸資料(array)： 資產累積 (分成 較好投報率、正常投報率、較差投報率 三條折線)
  const YLineData = {};

  // 投資期間(array)： 0 至 目標投資年限
  const invYearData = new Array(input.invYear + 1)
    .fill(0)
    .map((item, index) => index);

  // Y軸資料：累積資產(分成 較好投報率、正常投報率、較差投報率 三條折線)
  // 另外如果調整風險等級kyc 會有不同種之利率  註:kyc:0(保守), 1(穩健), 2(成長), 3(積極)
  const AssetAumData = situation.reduce((all, cur, Rindex) => {
    all[cur] = invYearData.map((year, index) => {
      return asset_Aum(input, constant)(
        year,
        constant.Rinvest[input.kyc][Rindex]
      );
    });
    return all;
  }, {});

  for (const item of situation) {
    YLineData[item] = AssetAumData[item];
  }

  return [XLineData, YLineData, AssetAumData];
}

/**
 * 以下兩個函式為 Echarts 升級 版本後修復 Dom 重複 init 警告所用
 */
// export function initEchartsWhenMounted(domIdStr) {
//   const ele = document.getElementById(domIdStr);
//   if (ele.getAttribute("_echarts_instance_") === null) {
//     return echarts.init(ele);
//   }
// }

// export function renderEchartsDom(thisObj, option) {
//   setTimeout(() => {
//     // thisObj.clear(); // 清除樣式
//     thisObj && thisObj.setOption(option, true);
//     thisObj && thisObj.resize();
//   }, 10);
// }
