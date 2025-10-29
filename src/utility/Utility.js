// 數字添加千分位逗點 適用負數與小數點
export const toThousand = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 千分位轉換number原型
export const commasToNumber = (str) => {
  return parseInt(str.toString().replace(/,/g, ""), 10) || 0;
};

// 加上千分位逗點（與 toThousand 功能相同，保留以維持向後兼容）
export const addCommas = (num) => {
  return toThousand(num);
};

// 格式化日期為 YYYYMMDD 格式
export const formatDateToYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份從0開始，所以 +1
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
};

// 處理股票數據
export const processStockData = (response) => {
  const dataIndex = response.fields.findIndex((name) => name === "日期");
  const priceIndex = response.fields.findIndex((name) => name === "收盤價");
  const processData = response.data
    .reduce((all, cur) => {
      all.push({
        date: cur[dataIndex],
        price: cur[priceIndex],
      });
      return all;
    }, [])
    .map((item) => ({
      ...item,
      date: item.date.replace(/\//g, "-"),
    }));
  return processData;
};
