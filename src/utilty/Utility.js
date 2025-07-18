// 數字添加千分位逗點 適用負數與小數點
export const toThousand = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 千分位轉換number原型
export const commasToNumber = (str) => {
  return parseInt(str.toString().replace(/,/g, ""), 10) || 0;
};

// 加上千分位逗點
export const addCommas = (num) => {
  return toThousand(num);
};

export const utilsEX = {
  // 格式化貨幣顯示
  formatCurrency: (amount, currency = selectedCurrency) => {
    const currencyInfo = currencies.find((c) => c.code === currency);
    if (!currencyInfo) return amount.toString();

    const formattedAmount = Math.round(amount).toLocaleString();
    return `${currencyInfo.symbol}${formattedAmount}`;
  },

  // 貨幣轉換
  convertCurrency: (
    amount,
    fromCurrency = "USD",
    toCurrency = selectedCurrency
  ) => {
    if (fromCurrency === toCurrency) return amount;

    // 先轉換為 USD
    const usdAmount =
      fromCurrency === "USD" ? amount : amount / exchangeRates[fromCurrency];

    // 再轉換為目標貨幣
    return toCurrency === "USD"
      ? usdAmount
      : usdAmount * exchangeRates[toCurrency];
  },

  // 轉換為當前選擇的貨幣
  convertToSelectedCurrency: (amount, fromCurrency = "USD") => {
    return utils.convertCurrency(amount, fromCurrency, selectedCurrency);
  },

  // 獲取貨幣資訊
  getCurrencyInfo: (currencyCode) => {
    return currencies.find((c) => c.code === currencyCode);
  },

  // 獲取匯率
  getExchangeRate: (currency) => {
    return exchangeRates[currency] || 1;
  },
};
