import { configureStore } from "@reduxjs/toolkit";
import commonSlice from "./modules/commonSlice";
// import blockMiddleware from "./modules/blockMiddleware";

const store = configureStore({
  reducer: {
    common: commonSlice,
  },
//   middleware: (getDefaultMiddleware) => {
//     return getDefaultMiddleware().concat(blockMiddleware);
//   },
});

export default store;
