import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import WealthPlan from "../components/WealthPlan";
import RetirePlan from "../components/RetirePlan";
import { RiskNotesProvider } from "../context/RiskContext";

const TrustCalculator = () => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [plan, setPlan] = useState(0);
  const [company, setCompany] = useState("Golden");
  const [logo, setLogo] = useState("");

  // 模擬 logo 圖片（實際使用時替換為真實圖片路徑）
  const logos = {
    Golden: "/api/placeholder/160/60",
    ENOCH: "/api/placeholder/160/60",
    Attendance: "/api/placeholder/160/60",
    GoodBigMoney: "/api/placeholder/160/60",
    ForeverPeace: "/api/placeholder/160/60",
    JyuMei: "/api/placeholder/160/60",
  };

  const choosePlan = (val) => {
    setPlan(val);
  };

  const href = () => {
    if (company === "GoodBigMoney") {
      return "https://bigmoney.goodins.life/uncategorized/32163/c-future-life";
    }
    return "#";
  };

  const btnChangeColor = (company) => {
    if (company === "ENOCH") {
      return ["#074163", "#FFFFFF"];
    } else if (company === "Attendance") {
      return ["#074163", "#FFFFFF"];
    } else if (company === "GoodBigMoney" || company === "JyuMei") {
      return ["#E63A36", "#FFFFFF"];
    } else if (company === "ForeverPeace") {
      return ["#0050A8", "#FFFFFF"];
    } else {
      return ["white", "#00000029"];
    }
  };

  useEffect(() => {
    // 從 URL 參數獲取公司類型（實際使用時可用 React Router）
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type");
    const companyType = [
      "ENOCH",
      "Attendance",
      "GoodBigMoney",
      "ForeverPeace",
      "JyuMei",
    ].includes(type)
      ? type
      : "Golden";

    setCompany(companyType);
    setLogo(logos[companyType]);

    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .main-kv {
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        .main-kv::before {
          content: "";
          background-image: url("/api/placeholder/1920/1080");
          background-size: cover;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          opacity: 0.41;
        }

        .pieChart {
          width: 100%;
          height: 100%;
          transform: scale(1.1);
        }

        .outline {
          stroke-width: 68;
          stroke: #fff;
          fill: none;
          opacity: 0;
          transition: all ease 450ms 1000ms;
        }

        [class^="pie"] {
          stroke-width: 58;
          fill: none;
          transition: all ease 450ms;
        }

        [class^="pie"]:hover {
          stroke-width: 70;
        }

        .pie-1-${company} {
          stroke-dasharray: 0 628.32;
          stroke-dashoffset: 328;
          stroke: ${company === "Golden"
            ? "#8E714F"
            : company === "ENOCH"
            ? "#005874"
            : company === "Attendance"
            ? "#005874"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#FFDC74"
            : "#3884DB"};
          transition-delay: 25ms;
        }

        .pie-2-${company} {
          stroke-dasharray: 0 628.32;
          stroke-dashoffset: 412;
          stroke: ${company === "Golden"
            ? "#CC9C50"
            : company === "ENOCH"
            ? "#0088AC"
            : company === "Attendance"
            ? "#0088AC"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#FDC725"
            : "#68BFFA"};
          transition-delay: 50ms;
        }

        .pie-3-${company} {
          stroke-dasharray: 0 628.32;
          stroke-dashoffset: 507;
          stroke: ${company === "Golden"
            ? "#E8B462"
            : company === "ENOCH"
            ? "#ACEDFF"
            : company === "Attendance"
            ? "#ACEDFF"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#FF9A9A"
            : "#00AF95"};
          transition-delay: 75ms;
        }

        .pie-4-${company} {
          stroke-dasharray: 0 628.32;
          stroke-dashoffset: -103;
          stroke: ${company === "Golden"
            ? "#F5D39C"
            : company === "ENOCH"
            ? "#EBC0AC"
            : company === "Attendance"
            ? "#F3D39C"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#F5211F"
            : "#FF9204"};
          transition-delay: 100ms;
        }

        .pie-5-${company} {
          stroke-dasharray: 0 628.32;
          stroke-dashoffset: 0;
          stroke: ${company === "Golden"
            ? "#A6C7A5"
            : company === "ENOCH"
            ? "#D35A23"
            : company === "Attendance"
            ? "#D0AD87"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#D80B04"
            : "#FE4358"};
          transition-delay: 125ms;
        }

        .pie-6-${company} {
          stroke-dasharray: 0 628.32;
          stroke-dashoffset: 329;
          stroke: ${company === "Golden"
            ? "#6BB169"
            : company === "ENOCH"
            ? "#004266"
            : company === "Attendance"
            ? "#003146"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#AE020B"
            : "#0052AE"};
          transition-delay: 150ms;
        }

        .animated .outline {
          opacity: 1;
        }

        .animated .pie-1-${company} {
          stroke-dasharray: 85 628.32;
        }
        .animated .pie-2-${company} {
          stroke-dasharray: 85 628.32;
        }
        .animated .pie-3-${company} {
          stroke-dasharray: 90 628.32;
        }
        .animated .pie-4-${company} {
          stroke-dasharray: 110 628.32;
        }
        .animated .pie-5-${company} {
          stroke-dasharray: 105 628.32;
        }
        .animated .pie-6-${company} {
          stroke-dasharray: 170 628.32;
        }

        .scroll-arrow {
          animation: scroll 0.35s ease-in alternate infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(10px);
          }
        }

        .option-area-${company} {
          background-color: ${company === "Golden"
            ? "#f2eada"
            : company === "ENOCH"
            ? "#F7F8F7"
            : company === "Attendance"
            ? "#F7F8F7"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#FFF7F7"
            : "#F7F8F7"};
        }

        .header-${company} {
          color: ${company === "Golden"
            ? "black"
            : company === "ENOCH" || company === "Attendance"
            ? "#004266"
            : company === "GoodBigMoney" || company === "JyuMei"
            ? "#393939"
            : "black"};
        }

        .hover-underline-${company} {
          position: relative;
        }

        .hover-underline-${company}::after {
          content: "";
          position: absolute;
          bottom: -20px;
          left: 50%;
          width: 0;
          height: 3px;
          background: ${company === "Golden" ? "#CC9C50" : "#FFFFFF"};
          transition: width 0.3s ease, left 0.3s ease;
        }

        .hover-underline-${company}:hover::after {
          width: 100%;
          left: 0;
        }

        .active-underline-${company} {
          position: relative;
          color: ${company === "Golden" ? "#CC9C50" : "#FFFFFF"};
        }

        .active-underline-${company}::after {
          content: "";
          position: absolute;
          bottom: -20px;
          left: 0;
          width: 100%;
          height: 3px;
          background: ${company === "Golden" ? "#CC9C50" : "#FFFFFF"};
          transition: width 0.3s ease, left 0.3s ease;
        }
      `}</style>

      {/* Main KV Section */}
      <section className={`main-kv overflow-hidden index-${company}`}>
        <div className="relative z-10">
          {/* Pie Chart */}
          <div className="flex justify-center pt-20">
            <div className={`w-96 h-96 ${isAnimated ? "animated" : ""}`}>
              <svg
                viewBox="20 0 450 400"
                className="pieChart"
                preserveAspectRatio="xMinYMin slice"
              >
                <circle className="outline" r="100" cx="210" cy="200" />
                <circle
                  className={`pie-1-${company}`}
                  r="100"
                  cx="210"
                  cy="200"
                />
                <circle
                  className={`pie-2-${company}`}
                  r="100"
                  cx="210"
                  cy="200"
                />
                <circle
                  className={`pie-3-${company}`}
                  r="100"
                  cx="210"
                  cy="200"
                />
                <circle
                  className={`pie-4-${company}`}
                  r="100"
                  cx="210"
                  cy="200"
                />
                <circle
                  className={`pie-5-${company}`}
                  r="100"
                  cx="210"
                  cy="200"
                />
                <circle
                  className={`pie-6-${company}`}
                  r="100"
                  cx="210"
                  cy="200"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="pb-20">
            <div
              className={`flex flex-col items-center text-2xl font-bold header-${company}`}
            >
              <h1>安養信託</h1>
              <h1>試算工具</h1>
            </div>
          </div>

          {/* Logo */}
          <div className="flex justify-center pb-10">
            <img src={logo} alt="Logo" className="w-40" />
          </div>

          {/* Scroll Arrow */}
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-wider">
              <span>scroll</span>
              <ChevronDown className="w-4 h-4 mx-auto mt-2 scroll-arrow" />
            </div>
          </div>
        </div>
      </section>

      {/* Plan Selection Buttons */}
      <section className="flex h-16">
        <button
          className={`w-1/2 text-xl font-medium transition-all duration-300 ${
            plan === 0
              ? "active-underline-" + company
              : "hover-underline-" + company
          }`}
          style={{
            backgroundColor:
              plan === 0
                ? btnChangeColor(company)[0]
                : btnChangeColor(company)[1],
            color:
              plan === 0 ? (company === "Golden" ? "black" : "white") : "black",
            opacity: plan === 0 ? 1 : 0.7,
          }}
          onClick={() => choosePlan(0)}
        >
          退休規劃
        </button>
        <button
          className={`w-1/2 text-xl font-medium transition-all duration-300 ${
            plan === 1
              ? "active-underline-" + company
              : "hover-underline-" + company
          }`}
          style={{
            backgroundColor:
              plan === 1
                ? btnChangeColor(company)[0]
                : btnChangeColor(company)[1],
            color:
              plan === 1 ? (company === "Golden" ? "black" : "white") : "black",
            opacity: plan === 1 ? 1 : 0.7,
          }}
          onClick={() => choosePlan(1)}
        >
          累積財富
        </button>
      </section>

      {/* Plan Components */}
      <RiskNotesProvider>
        <div className="min-h-96 bg-white">
          {plan === 0 && <RetirePlan />}
          {plan === 1 && <WealthPlan />}
        </div>
      </RiskNotesProvider>

      {/* Footer Section */}
      <section className={`option-area-${company} pb-10`}>
        <div className="flex justify-center pt-4">
          <a href={href()} target="_blank" rel="noopener noreferrer">
            <button className="bg-red-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-red-700 transition-colors">
              了解更多
            </button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default TrustCalculator;
