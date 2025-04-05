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
    <div className="w-screen h-fit  text-white  py-10">
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Left Section - Text Content */}
        <motion.div
          className="w-1/2 flex flex-col justify-center items-center text-center space-y-6"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold text-black  leading-tight">
            Why  <span className="text-[#A31C44]">HSquare</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
           your stay should be more than just a place to sleep! Enjoy premium comfort, thoughtfully curated experiences, and a vibrant atmosphere that makes every moment special. From cozy rooms to top-tier amenities, we redefine hospitality. 🌍💛 
          <span className="font-bold text-[#A31C44]"> #BeyondStay</span>
          </p>
        </motion.div>

        {/* Right Section - Image Slider */}
        <div className="w-1/2 relative flex items-center justify-center">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 150, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -150, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative w-[580px] h-[500px] group overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={image[currentIndex]}
              alt="Room"
              className="w-full h-full object-cover rounded-2xl transition duration-300 group-hover:blur-sm"
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col gap-4 items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
              <p className="text-white text-5xl font-bold">Room & Facilities</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-lg border border-gray-200 px-4 py-2"
              >
                Read more
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Features;