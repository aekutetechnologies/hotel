"use client"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import room1 from "/public/images/feature/room1.jpg";
import room2 from "/public/images/feature/room2.jpg";
import room3 from "/public/images/feature/room3.jpg";
import fhostel1 from "/public/images/feature/fhostel1.webp";
import fhostel2 from "/public/images/feature/fhostel2.jpg";
import fhostel3 from "/public/images/feature/fhostel3.jpeg";

const images = [room1, room2, room3];
const hostelImages = [fhostel1, fhostel2, fhostel3];

interface FeaturesSectionProps {
  sectionType: "hotels" | "hostels";
}

const Features = ({sectionType}:FeaturesSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const image = sectionType === "hotels" ? images : hostelImages;

  useEffect(() => {
    if (isHovered) return; // Pause auto-scroll when hovered

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div className="w-full h-fit text-white py-10 px-4 sm:px-6">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Text Content - Stacks on top on mobile */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center items-center text-center space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
            Why <span className="text-[#A31C44]">HSquare</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Your stay should be more than just a place to sleep! Enjoy premium comfort, thoughtfully curated experiences, and a vibrant atmosphere that makes every moment special. From cozy rooms to top-tier amenities, we redefine hospitality. 🌍💛 
            <span className="font-bold text-[#A31C44]"> #BeyondStay</span>
          </p>
        </motion.div>

        {/* Image Slider - Goes below on mobile */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center mt-6 lg:mt-0">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] max-w-[580px] group overflow-hidden"
          >
            <Image
              src={image[currentIndex]}
              alt="Room"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 580px"
              className="object-cover rounded-2xl transition duration-300"
              priority
            />
            
            {/* Navigation dots for the slider */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
              {image.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentIndex === index 
                      ? "bg-white scale-110" 
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Features;