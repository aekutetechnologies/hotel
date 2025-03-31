"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { SearchForm } from "./SearchForm";
import { Building, MapPin, Users, Star } from "lucide-react";
import { useEffect, useState } from "react";

// Custom CSS for radial gradient overlay
const overlayStyles = {
  hotels: {
    background: "radial-gradient(circle at center, rgba(94, 15, 38, 0.9) 0%, rgba(94, 15, 38, 0.7) 90%)",
  },
  hostels: {
    background: "radial-gradient(circle at center, rgba(30, 41, 59, 0.9) 0%, rgba(30, 41, 59, 0.7) 90%)",
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
  // Track whether component has mounted to trigger animations
  const [isInView, setIsInView] = useState(false);
  
  return (
    <>
      <div
        className={`pt-8 pb-16 ${
          sectionType === "hotels"
            ? "bg-gradient-to-r from-[#e28ca9] via-[#a42145] to-[#e28ca9]"
            : "bg-gradient-to-r from-slate-300 via-slate-600 to-slate-300"
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

      {/* Statistics Section */}
      <div className="bg-white py-10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onViewportEnter={() => setIsInView(true)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {/* Cities Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" 
              }}
              className="bg-gray-50 rounded-lg p-6 text-center"
            >
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
              >
                <div className={`rounded-full p-3 ${
                  sectionType === "hotels" ? "bg-red-50" : "bg-slate-50"
                }`}>
                  <MapPin className={`h-8 w-8 ${
                    sectionType === "hotels" ? "text-red-600" : "text-slate-600"
                  }`} />
                </div>
              </motion.div>
              <h3 className="text-4xl font-bold mb-2">
                {isInView ? <Counter value={10} /> : "0+"}
              </h3>
              <p className="text-gray-600">Areas Covered in Mumbai</p>
            </motion.div>

            {/* Properties Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" 
              }}
              className="bg-gray-50 rounded-lg p-6 text-center"
            >
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
              >
                <div className={`rounded-full p-3 ${
                  sectionType === "hotels" ? "bg-red-50" : "bg-slate-50"
                }`}>
                  <Building className={`h-8 w-8 ${
                    sectionType === "hotels" ? "text-red-600" : "text-slate-600"
                  }`} />
                </div>
              </motion.div>
              <h3 className="text-4xl font-bold mb-2">
                {isInView ? <Counter value={12} /> : "0+"}
              </h3>
              <p className="text-gray-600">
                {sectionType === "hotels" ? "Hotels" : "Hostels"} Available
              </p>
            </motion.div>

            {/* Happy Customers Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" 
              }}
              className="bg-gray-50 rounded-lg p-6 text-center"
            >
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
              >
                <div className={`rounded-full p-3 ${
                  sectionType === "hotels" ? "bg-red-50" : "bg-slate-50"
                }`}>
                  <Users className={`h-8 w-8 ${
                    sectionType === "hotels" ? "text-red-600" : "text-slate-600"
                  }`} />
                </div>
              </motion.div>
              <h3 className="text-4xl font-bold mb-2">
                {isInView ? <Counter value={1000} /> : "0+"}
              </h3>
              <p className="text-gray-600">Happy Customers</p>
            </motion.div>

            {/* Positive Reviews Stat */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" 
              }}
              className="bg-gray-50 rounded-lg p-6 text-center"
            >
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
              >
                <div className={`rounded-full p-3 ${
                  sectionType === "hotels" ? "bg-red-50" : "bg-slate-50"
                }`}>
                  <Star className={`h-8 w-8 ${
                    sectionType === "hotels" ? "text-red-600" : "text-slate-600"
                  }`} />
                </div>
              </motion.div>
              <motion.h3 
                className="text-4xl font-bold mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: isInView ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  initial={{ y: 20 }}
                  animate={{ y: isInView ? 0 : 20 }}
                  transition={{ duration: 0.5 }}
                >
                  4.9
                </motion.span>
              </motion.h3>
              <p className="text-gray-600">Average Rating</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
