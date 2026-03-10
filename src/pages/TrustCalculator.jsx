import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { ChevronDown } from "lucide-react";
import WealthPlan from "../components/WealthPlan";
import RetirePlan from "../components/RetirePlan";
import { toThousand, addCommas, commasToNumber } from "../utility/Utility";
import ExchangeControl from "../components/ExchangeControl";
import SlidingBlock from "../components/SlidingBlock";
import StockData from "../components/StockData";
import "../styles/pages/TrustCalculator.scss";

const TrustCalculator = () => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [plan, setPlan] = useState(0);
  const nextSectionRef = useRef(null);

  // Memoize utility functions to prevent recreating on each render
  const utilityFunctions = useMemo(
    () => ({
      toThousand,
      addCommas,
      commasToNumber,
    }),
    []
  );

  // Memoize scroll handler
  const handleScroll = useCallback(() => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Memoize plan chooser
  const choosePlan = useCallback((val) => {
    setPlan(val);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const pieCircles = useMemo(() => {
    const circles = [];
    const circleProps = {
      r: 100,
      cx: 210,
      cy: 200,
    };
    circles.push(
      <circle key="outlines" className="outlines" {...circleProps} />
    );
    for (let i = 1; i <= 6; i++) {
      circles.push(
        <circle key={`pie-${i}`} className={`pie-${i}`} {...circleProps} />
      );
    }

    return circles;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main KV */}
      <div className={`main-kv overflow-hidden index`}>
        <div className="relative z-10">
          {/* PieChart */}
          <div className="flex justify-center pt-20">
            <div className={`w-96 h-96 ${isAnimated ? "animated" : ""}`}>
              <svg
                viewBox="20 0 450 400"
                className="pieChart"
                preserveAspectRatio="xMinYMin slice"
              >
                {pieCircles}
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="pb-20">
            <div
              className={`flex flex-col items-center text-2xl font-bold heade`}
            >
              <h1>台股ETF投資</h1>
              <h1>簡易試算工具</h1>
            </div>
          </div>

          {/* Scroll Down */}
          <div className="text-center mb-10">
            <div
              className="text-xs uppercase tracking-wider"
              style={{ cursor: "pointer" }}
              onClick={handleScroll}
            >
              <span className="text-lg">click me to scroll</span>
              <ChevronDown size={36} className="mx-auto mt-2 scroll-arrow" />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Choose Buttons */}
      <div ref={nextSectionRef} className="flex h-16">
        <button
          className={`w-1/2 text-xl font-medium transition-all duration-300 ${
            plan === 0 ? "active-underline" : "hover-underline"
          }`}
          style={{
            backgroundColor: plan === 0 ? "white" : "#00000029",
            opacity: plan === 0 ? 1 : 0.7,
          }}
          onClick={() => choosePlan(0)}
        >
          退休規劃
        </button>
        <button
          className={`w-1/2 text-xl font-medium transition-all duration-300 ${
            plan === 1 ? "active-underline" : "hover-underline"
          }`}
          style={{
            backgroundColor: plan === 1 ? "white" : "#00000029",
            opacity: plan === 1 ? 1 : 0.7,
          }}
          onClick={() => choosePlan(1)}
        >
          累積財富
        </button>
      </div>

      {/* Plan Components With Exchange */}
      <ExchangeControl />
      {/* <SlidingBlock>
        <StockData />
      </SlidingBlock> */}
      {plan === 0 && <RetirePlan utils={utilityFunctions} />}
      {plan === 1 && <WealthPlan utils={utilityFunctions} />}

      {/* Footer */}
      <div className="py-8" style={{ backgroundColor: "beige" }}>
        <div className="flex justify-center pt-4">
          {/* Tooltip 容器：使用 group 類別 */}
          <div className="relative group">
            {/* Tooltip 本體 */}
            <div
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 
                            px-3 py-2 bg-slate-800 text-white text-xs rounded-lg 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                            whitespace-nowrap pointer-events-none z-20"
            >
              點擊前往0050與00631L定期定額試算工具
              {/* 小三角形箭頭 */}
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 
                              border-8 border-transparent border-t-slate-800"
              ></div>
            </div>

            {/* 按鈕本體 */}
            <button
              className="bg-red-600 text-white px-8 py-3 rounded-xl text-lg font-medium 
                         hover:bg-red-700 transition-colors shadow-lg active:transform active:scale-95"
              onClick={() =>
                window.open(
                  "https://hiltonpo.github.io/ETF_calculator/",
                  "_blank"
                )
              }
            >
              了解更多
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustCalculator;
