// 數字添加千分位逗點 適用負數與小數點
export function toThousand(num, digits = 0) {
  function thousand(integerStr: string) {
    const arr = [];
    let integerLength = integerStr.length;
    while (true) {
      arr.unshift(
        integerStr.substring(Math.max(integerLength - 3, 0), integerLength)
      );
      integerLength = integerLength - 3;
      if (Math.max(integerLength, 0) === 0) break;
    }
    return arr.join(",");
  }

  const money = Number(num).toFixed(digits);
  const float = money.split(".")[1];
  let number;
  // 負數 不含小數點
  if (money.includes("-") && digits) {
    number = money.toString().substr(1, money.length).split(".")[0];
    return `-${thousand(number)}.${float}`;
  }
  // 負數 含小數點
  if (money.includes("-") && !digits) {
    return thousand(money);
  }
  // 正數 不含小數點
  if (!money.includes("-") && !digits) {
    return thousand(money);
  }
  // 正數 含小數點
  if (!money.includes("-") && digits) {
    number = money.toString().split(".")[0];
    return `${thousand(number)}.${float}`;
  }
}

// 千分位轉換number原型
export function commasToNumber(commas) {
  const value = commas.split(",").join("");
  return Number(value) || 0;
}

// 加上千分位逗點
export function addCommas(money) {
  if (isNaN(Number(money)) === false) return toThousand(money);
  if (isNaN(Number(money)) !== false) return "0";
}
