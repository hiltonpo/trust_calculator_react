import { createContext } from "react";

// 顏色配置
const colors = {
  background: "#f2eada",
  text: "black",
  thumb: "#cc9c50",
  notice: "#837151",
  riskBtn: "bg-yellow-600",
  bar: "#cc9c50",
};

const CommonContext = createContext({ colors });

export default CommonContext;
