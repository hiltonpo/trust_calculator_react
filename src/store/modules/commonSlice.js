import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

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
    } catch (error) {
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
  lastUpdate: new Date().toISOString(),
  error: null,
  currencies,
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
  },
  reducers: {
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.exchangeRates = action.payload;
        state.lastUpdate = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

const stateCommon = (state) => state.common;

export const selectSelectedCurrency = (state) => state.common.selectedCurrency;
export const selectLoading = (state) => state.common.loading;
export const selectLastUpdate = (state) => state.common.lastUpdate;
export const selectError = (state) => state.common.error;
export const selectCurrencies = (state) => state.common.currencies;

export const selectExchangeRates = createSelector(
  [stateCommon],
  (common) => common.exchangeRates
);

export const { setSelectedCurrency } = commonSlice.actions;
export default commonSlice.reducer;
