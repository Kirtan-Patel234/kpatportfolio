"use client";

import { useEffect, useState } from "react";

interface ScrollSpyDotProps {
  id: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

const ScrollSpyDot: React.FC<ScrollSpyDotProps> = ({ id, isActive, onClick }) => (
  <div
    className={`w-3 h-3 rounded-full my-1 cursor-pointer transition-all duration-200 ${
      isActive ? "bg-sky-500 scale-125" : "bg-sky-200 hover:bg-sky-400"
    }`}
    onClick={() => onClick(id)}
  />
);

interface ScrollSpyProps {
  sectionIds: string[];
  thresholds: number[]; // scrollY values where sections change
}

export default function ScrollSpy({ sectionIds, thresholds }: ScrollSpyProps) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0]);

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Loop through thresholds and find the last threshold that scrollY is past
    let activeIndex = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (scrollY >= thresholds[i]) activeIndex = i;
      else break;
    }

    setActiveSection(sectionIds[activeIndex]);
  };

  const handleDotClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    handleScroll(); // set initial active dot
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-50">
      {sectionIds.map((id) => (
        <ScrollSpyDot
          key={id}
          id={id}
          isActive={activeSection === id}
          onClick={handleDotClick}
        />
      ))}
    </div>
  );
}
