import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SlidingBlock = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div style={{ background: "rgb(228 244 255)" }}>
      <div className="container mx-auto px-4 pt-4 pb-2">
        <button onClick={togglePanel} className="cursor-pointer">
          <h1 className="text-2xl font-bold text-gray-900">股票資訊</h1>
        </button>
        <div
          style={{
            height: `${height}px`,
            transition: `height 300ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
          className="overflow-hidden"
        >
          <div ref={contentRef} className="container mx-auto px-4 py-6">
            {children}
          </div>
        </div>
        <div
          onClick={togglePanel}
          className={`flex justify-center cursor-pointer mt-2 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown
            size={36}
            className="flex justify-center text-gray-500 scroll-arrow"
          />
        </div>
      </div>
    </div>
  );
};

export default SlidingBlock;
