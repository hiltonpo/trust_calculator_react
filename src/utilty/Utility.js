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
