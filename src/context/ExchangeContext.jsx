import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
const ExchangeContext = createContext();

// 匯率 Provider 組件
export const ExchangeProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    TWD: 32.5,
    JPY: 150,
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState(null);

  // 使用 ref 追蹤是否已經初始化
  const hasInitialized = useRef(false);

  // 貨幣
  const currencies = [
    { code: "USD", name: "美元", symbol: "$" },
    { code: "TWD", name: "台幣", symbol: "NT$" },
    { code: "JPY", name: "日圓", symbol: "¥" },
  ];

  // 模擬 API 呼叫獲取匯率
  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      const data = await response.json();
      const { JPY, TWD } = data.rates;

      setExchangeRates({
        USD: 1,
        TWD: TWD,
        JPY: JPY,
      });
      setLastUpdate(new Date());
    } catch (err) {
      setError("獲取匯率失敗，請稍後再試");
      console.error("匯率獲取錯誤:", err);
    } finally {
      setLoading(false);
    }
  };

  // 自動獲取匯率
  useEffect(() => {
    // 初次執行
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchExchangeRates();
    }
  }, []);

  const value = {
    selectedCurrency,
    exchangeRates,
    loading,
    lastUpdate,
    error,
    currencies,

    setSelectedCurrency,
    fetchExchangeRates,
  };

  return (
    <ExchangeContext.Provider value={value}>
      {children}
    </ExchangeContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error("useCurrency must be used within a ExchangeProvider");
  }
  return context;
};

export default ExchangeContext;
