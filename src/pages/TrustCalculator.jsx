import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown } from "lucide-react";
import WealthPlan from "../components/WealthPlan";
import RetirePlan from "../components/RetirePlan";
import { toThousand, addCommas, commasToNumber } from "../utilty/Utility";
import { ExchangeProvider } from "../context/ExchangeContext";
import ExchangeControl from "../components/ExchangeControl";
import "../styles/pages/TrustCalculator.scss";

const TrustCalculator = () => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [plan, setPlan] = useState(0);
  const nextSectionRef = useRef(null);

  const utilityFunctions = {
    toThousand,
    addCommas,
    commasToNumber,
  };

  const handleScroll = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const choosePlan = (val) => {
    setPlan(val);
  };

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
              <h1>安養信託</h1>
              <h1>試算工具</h1>
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
              <ChevronDown className="w-4 h-4 mx-auto mt-2 scroll-arrow" />
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
      <ExchangeProvider>
        <ExchangeControl />
        {plan === 0 && <RetirePlan utils={utilityFunctions} />}
        {plan === 1 && <WealthPlan utils={utilityFunctions} />}
      </ExchangeProvider>

      {/* Footer */}
      <div className="py-4" style={{ backgroundColor: "beige" }}>
        <div className="flex justify-center pt-4">
          <button className="bg-red-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-red-700 transition-colors">
            了解更多
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustCalculator;
