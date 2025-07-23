import React from "react";
import {
  RefreshCw,
  BadgeDollarSign,
  DollarSign,
  JapaneseYen,
  AlertCircle,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedCurrency,
  fetchExchangeRates,
  selectSelectedCurrency,
  selectLoading,
  selectLastUpdate,
  selectError,
  selectCurrencies,
  selectExchangeRates,
} from "../store/modules/commonSlice";

const ExchangeControl = () => {
  const dispatch = useDispatch();

  const selectedCurrency = useSelector(selectSelectedCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const loading = useSelector(selectLoading);
  const lastUpdate = useSelector(selectLastUpdate);
  const error = useSelector(selectError);
  const currencies = useSelector(selectCurrencies);

  const currencyIcons = {
    USD: BadgeDollarSign,
    TWD: DollarSign,
    JPY: JapaneseYen,
  };

  // useEffect(() => {
  //   if (!hasInitialized) {
  //     dispatch(setInitialized());
  //     dispatch(fetchExchangeRates());
  //   }
  // }, [dispatch, hasInitialized]);

  return (
    <div style={{ background: "#FBF8E6" }}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900">貨幣選擇</h1>

          {/* 匯率選擇和更新 */}
          <div className="absolute right-5">
            <button
              onClick={() => {
                dispatch(fetchExchangeRates());
              }}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>{loading ? "更新中..." : "更新匯率"}</span>
            </button>
          </div>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 匯率資訊 */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {currencies.map((currency) => {
            const Icon = currencyIcons[currency.code];
            const isSelected = currency.code === selectedCurrency;
            return (
              <div
                key={currency.code}
                className={`py-3 rounded-lg border transition-colors flex justify-center items-center ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => dispatch(setSelectedCurrency(currency.code))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-sm">{currency.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-mono">
                    {currency.code === "USD"
                      ? "1.00"
                      : exchangeRates[currency.code]?.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          最後更新: {lastUpdate.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ExchangeControl;
