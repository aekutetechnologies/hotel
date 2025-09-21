"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { SearchForm } from "./SearchForm";
import { useEffect, useState } from "react";

// Custom CSS for radial gradient overlay
const overlayStyles = {
  hotels: {
    background: "radial-gradient(circle at center, rgba(178, 30, 66, 0.9) 0%, rgba(178, 30, 66, 0.7) 90%)",
  },
  hostels: {
    background: "radial-gradient(circle at center, rgba(178, 30, 66, 0.9) 0%, rgba(178, 30, 66, 0.7) 90%)",
  },
};

interface HeroSectionProps {
  sectionType: "hotels" | "hostels";
}

// Component for animated counter
const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayValue = useTransform(rounded, (latest) => {
    if (latest >= 1000) {
      return `${(latest / 1000).toFixed(0)}K+`;
    }
    return `${latest}+`;
  });

  useEffect(() => {
    const animation = animate(count, value, { duration });
    return animation.stop;
  }, [count, value, duration]);

  return <motion.span>{displayValue}</motion.span>;
};

export function HeroSection({ sectionType }: HeroSectionProps) {
  
  return (
    <>
      <div
        className={`pt-8 pb-16 ${
          sectionType === "hotels"
            ? "bg-gradient-to-r from-[#e28ca9] via-[#a42145] to-[#e28ca9]"
            : "bg-gradient-to-r from-[#e28ca9] via-[#a42145] to-[#e28ca9]"
        } relative overflow-hidden`}
      >
        {/* Additional darker radial gradient to focus on search form */}
        <div 
          className="absolute inset-0" 
          style={sectionType === "hotels" ? overlayStyles.hotels : overlayStyles.hostels}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-8 text-center text-white ">
              {sectionType === "hotels"
                ? "Find Your Perfect Hotel"
                : "Discover Your Ideal Hostel"}
            </h2>
            <p className="text-xl text-white text-center mb-8">
              {sectionType === "hotels"
                ? "Book by hour or day - flexibility that suits your schedule"
                : "Find your perfect stay in our vibrant hostels"}
            </p>

            <SearchForm sectionType={sectionType} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
