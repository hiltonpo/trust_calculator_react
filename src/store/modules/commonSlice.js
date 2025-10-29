import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { formatDateToYYYYMMDD, processStockData } from "../../utility/Utility";

// 異步thunk 獲取股票資訊（台灣證券交易所）
export const fetchStockData = createAsyncThunk(
  "stock/fetchStockData",
  async (
    {
      date = formatDateToYYYYMMDD(
        new Date(new Date().setDate(new Date().getDate() - 1))
      ),
      stockNo = "0050",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // 延遲1秒
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        `/api/stockDay?response=json&date=${date}&stockNo=${stockNo}`
      );
      if (!response.ok) {
        throw new Error("網路請求失敗");
      }
      const data = await response.json();
      return processStockData(data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 異步thunk 獲取匯率
export const fetchExchangeRates = createAsyncThunk(
  "exchange/fetchExchangeRates",
  async (_, { rejectWithValue }) => {
    try {
      // 延遲1秒
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );

      if (!response.ok) {
        throw new Error("網路請求失敗");
      }

      const data = await response.json();
      const { JPY, TWD } = data.rates;

      return {
        USD: 1,
        TWD: TWD,
        JPY: JPY,
      };
    } catch {
      return rejectWithValue("獲取匯率失敗，請稍後再試");
    }
  }
);

// 貨幣
const currencies = [
  { code: "USD", name: "美元", symbol: "$" },
  { code: "TWD", name: "台幣", symbol: "NT$" },
  { code: "JPY", name: "日圓", symbol: "¥" },
];

const exchangeInitialState = {
  selectedCurrency: "USD",
  exchangeRates: {
    USD: 1,
    TWD: 32.5,
    JPY: 150,
  },
  loading: false,
  lastUpdate: new Date().toLocaleString(),
  error: null,
  currencies,
};

const stockInitialState = {
  stockAllData: [],
  stockError: null,
  stockLoading: false,
  stockLastUpdate: new Date().toLocaleString(),
};

const commonSlice = createSlice({
  name: "common",
  initialState: {
    colors: {
      background: "#f2eada",
      text: "black",
      thumb: "#cc9c50",
      notice: "#837151",
      riskBtn: "bg-yellow-600",
      bar: "#cc9c50",
    },
    ...exchangeInitialState,
    ...stockInitialState,
  },
  reducers: {
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Exchange rates reducers
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRates = action.payload;
        state.lastUpdate = new Date().toLocaleString();
        state.error = null;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Stock data reducers
      .addCase(fetchStockData.pending, (state) => {
        state.stockLoading = true;
        state.stockError = null;
      })
      .addCase(fetchStockData.fulfilled, (state, action) => {
        state.stockAllData = action.payload;
        state.stockLoading = false;
        state.stockLastUpdate = new Date().toLocaleString();
        state.stockError = null;
      })
      .addCase(fetchStockData.rejected, (state, action) => {
        state.stockLoading = false;
        state.stockError = action.payload;
      });
  },
});

// Base selectors
const selectCommon = (state) => state.common;

// Exchange rate selectors
export const selectSelectedCurrency = (state) => state.common.selectedCurrency;
export const selectLoading = (state) => state.common.loading;
export const selectLastUpdate = (state) => state.common.lastUpdate;
export const selectError = (state) => state.common.error;
export const selectCurrencies = (state) => state.common.currencies;

export const selectExchangeRates = createSelector(
  [selectCommon],
  (common) => common.exchangeRates
);

// Stock data selectors
export const selectStockData = (state) => state.common.stockAllData;
export const selectStockLoading = (state) => state.common.stockLoading;
export const selectStockError = (state) => state.common.stockError;
export const selectStockLastUpdate = (state) => state.common.stockLastUpdate;

// Colors selector
export const selectColors = (state) => state.common.colors;

export const { setSelectedCurrency } = commonSlice.actions;
export default commonSlice.reducer;
