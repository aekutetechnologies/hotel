"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const themeColor = sectionType === "hotels" ? "#A31C44" : "#A31C44";
  
  const phrases = sectionType === "hotels" 
    ? ["Exceptional Comfort", "Memorable Moments", "Culinary Delights"] 
    : ["Authentic Connections", "Budget Freedom", "Local Experiences"];

  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    if (isHovered) return; // Pause auto-scroll when hovered

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);
  
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2000);
    
    return () => clearInterval(phraseInterval);
  }, [phrases.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="w-full h-fit text-white py-16 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Text Content - Stacks on top on mobile */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center items-center text-center space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="relative">
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              Experience <span className="relative inline-block">
                <span 
                  className="absolute inset-0" 
                  style={{ 
                    backgroundImage: `linear-gradient(90deg, transparent, ${themeColor}33, transparent)`,
                    backgroundSize: "200% 100%",
                    backgroundPosition: "0% 0%"
                  }}
                >
                  <motion.span 
                    className="block w-full h-full"
                    animate={{ backgroundPositionX: ["0%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </span>
                <span className="relative" style={{ color: themeColor }}>HSquare</span>
              </span>
            </motion.h1>
            
            <motion.div 
              className="mt-4 h-8 overflow-hidden relative"
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentPhrase}
                  className="text-xl md:text-2xl text-gray-600 absolute inset-0 whitespace-nowrap"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {phrases[currentPhrase]}
                </motion.h2>
              </AnimatePresence>
            </motion.div>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg text-gray-600 max-w-md mx-auto leading-relaxed"
          >
            {sectionType === "hotels" ? (
              <>
                Beyond ordinary stays, our <span className="font-semibold">hotels redefine luxury</span>. 
                Immerse in thoughtfully crafted spaces where every detail exceeds expectations—from 
                <motion.span 
                  className="inline-block px-1 font-medium" 
                  style={{ color: themeColor }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
                >
                  personalized service
                </motion.span> 
                to culinary excellence. Experience the extraordinary.
              </>
            ) : (
              <>
                Not just a place to stay, our <span className="font-semibold">hostels create communities</span>. 
                Connect with fellow travelers in vibrant spaces designed for 
                <motion.span 
                  className="inline-block px-1 font-medium" 
                  style={{ color: themeColor }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
                >
                  authentic experiences
                </motion.span> 
                without compromising comfort or your budget.
              </>
            )}
          </motion.p>
        </motion.div>

        {/* Image Slider - Goes below on mobile */}
        <motion.div 
          className="w-full lg:w-1/2 relative flex items-center justify-center mt-6 lg:mt-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl -z-10"
            style={{ 
              backgroundImage: `radial-gradient(circle at 50% 50%, ${themeColor}20 0%, transparent 70%)`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center center",
              filter: "blur(40px)" 
            }}
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
          />
          
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeInOut",
              rotateY: { type: "spring", stiffness: 100 }
            }}
            className="relative w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] max-w-[580px] group overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 shadow-xl rounded-2xl overflow-hidden">
              <Image
                src={image[currentIndex]}
                alt={sectionType === "hotels" ? "Luxury Hotel Experience" : "Vibrant Hostel Community"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 580px"
                className="object-cover transition duration-700 ease-in-out transform group-hover:scale-110"
                priority
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              />
            </div>
            
            {/* Feature Badge */}
            <motion.div 
              className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-medium" style={{ color: themeColor }}>
                {sectionType === "hotels" ? "Premium Selection" : "Top Rated"}
              </span>
            </motion.div>
            
            {/* Bottom Info */}
            <motion.div 
              className="absolute bottom-8 left-0 right-0 mx-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <p className="font-semibold text-gray-800">
                {sectionType === "hotels" 
                  ? ["Exquisite Suites", "Luxury Rooms", "Fine Dining"][currentIndex] 
                  : ["Community Spaces", "Private Pods", "Local Experiences"][currentIndex]
                }
              </p>
              <p className="text-sm text-gray-600">
                {sectionType === "hotels" 
                  ? ["Unwind in spacious luxury", "Big rooms with comfy beds", "Delicious food"][currentIndex] 
                  : ["Connect with fellow travelers", "Privacy within community", "Authentic local insights"][currentIndex]
                }
              </p>
            </motion.div>
            
            {/* Navigation dots for the slider */}
            <div className="absolute bottom-[-30px] left-0 right-0 flex justify-center space-x-3">
              {image.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all`}
                  style={{ 
                    backgroundColor: currentIndex === index 
                      ? themeColor
                      : `${themeColor}40`
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={currentIndex === index ? {
                    scale: [1, 1.2, 1],
                    transition: { duration: 1, repeat: Infinity }
                  } : {}}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;