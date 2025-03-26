"use client";

import { motion } from "framer-motion";
import { SearchForm } from "./SearchForm";

interface HeroSectionProps {
  sectionType: "hotels" | "hostels";
}

export function HeroSection({ sectionType }: HeroSectionProps) {
  return (
    <div
      className={`py-16 ${
        sectionType === "hotels"
          ? "bg-gradient-to-r from-[#b95372] via-[#7A1533] to-[#b95372]"
          : "bg-gradient-to-r from-slate-400 via-slate-700 to-slate-400"
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-6xl font-bold mb-8 text-center text-white ">
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
  );
}
