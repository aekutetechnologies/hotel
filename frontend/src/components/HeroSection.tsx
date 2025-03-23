"use client"

import { motion } from "framer-motion"
import { SearchForm } from "./SearchForm"

interface HeroSectionProps {
  sectionType: "hotels" | "hostels"
}

export function HeroSection({ sectionType }: HeroSectionProps) {
  return (
    <div
      className={`py-16 ${
        sectionType === "hotels"
          ? "bg-gradient-to-b from-[#A31C44] to-[#7A1533]"
          : "bg-gradient-to-b from-[#2A2B2E] to-[#1A1B1E]"
      }`}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-8 text-center text-white font-rock-salt">
            {sectionType === "hotels" ? "Find Your Perfect Hotel" : "Discover Your Ideal Hostel"}
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
  )
} 