"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { NewButton } from "@/components/ui/new-button";
import hotels from "/public/hotels.png";
import hostels from "/public/hostels.png";

interface HomeHeroProps {
  hotelImages: string[];
  hostelImages: string[];
  expandedSection: "hotels" | "hostels" | null;
  setExpandedSection: React.Dispatch<
    React.SetStateAction<"hotels" | "hostels" | null>
  >;
  handleDiscover: (section: "hotels" | "hostels") => void;
  handleExpandedSectionClick?: (section: "hotels" | "hostels") => void;
}

export function HomeHero({
  hotelImages,
  hostelImages,
  expandedSection,
  setExpandedSection,
  handleDiscover,
  handleExpandedSectionClick,
}: HomeHeroProps) {
  const [currentHotelImage, setCurrentHotelImage] = useState(0);
  const [currentHostelImage, setCurrentHostelImage] = useState(0);
  const [nextHotelImage, setNextHotelImage] = useState(0);
  const [nextHostelImage, setNextHostelImage] = useState(0);
  
  // Shine effect for stickers
  const hotelShineAngle = useMotionValue(15);
  const hostelShineAngle = useMotionValue(15);
  
  // Auto-animate shine effects
  useEffect(() => {
    let hotelShineInterval: NodeJS.Timeout;
    let hostelShineInterval: NodeJS.Timeout;
    
    if (expandedSection === "hotels" || expandedSection === null) {
      hostelShineInterval = setInterval(() => {
        const currentValue = hostelShineAngle.get();
        hostelShineAngle.set((currentValue + 2) % 50);
      }, 100);
    }
    
    if (expandedSection === "hostels" || expandedSection === null) {
      hotelShineInterval = setInterval(() => {
        const currentValue = hotelShineAngle.get();
        hotelShineAngle.set((currentValue + 2) % 50);
      }, 100);
    }
    
    return () => {
      clearInterval(hotelShineInterval);
      clearInterval(hostelShineInterval);
    };
  }, [expandedSection, hotelShineAngle, hostelShineAngle]);

  useEffect(() => {
    const hotelTimer = setInterval(() => {
      setNextHotelImage((prev) => (prev + 1) % hotelImages.length);
    }, 5000);

    const hostelTimer = setInterval(() => {
      setNextHostelImage((prev) => (prev + 1) % hostelImages.length);
    }, 5000);

    return () => {
      clearInterval(hotelTimer);
      clearInterval(hostelTimer);
    };
  }, [hotelImages.length, hostelImages.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentHotelImage(nextHotelImage);
    }, 1000); // Delay to allow for fade transition
    return () => clearTimeout(timer);
  }, [nextHotelImage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentHostelImage(nextHostelImage);
    }, 1000); // Delay to allow for fade transition
    return () => clearTimeout(timer);
  }, [nextHostelImage]);

  const handleSectionClick = (section: "hotels" | "hostels") => {
    if (expandedSection === section && handleExpandedSectionClick) {
      // If section is already expanded and we click on it, go to detail view
      handleExpandedSectionClick(section);
    } else {
      // Otherwise toggle expansion
      setExpandedSection((prev) => (prev === section ? null : section));
    }
  };

  const handleBack = () => {
    setExpandedSection(null);
  };

  const sectionVariants = {
    initial: { width: "0%", opacity: 0 },
    animate: {
      width: "50%",
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
      width: "0%",
      opacity: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
    expanded: {
      width: "80%",
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
    collapsed: {
      width: "20%",
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const textRevealVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.5,
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };
  const text = "Hotels";
  const textHostel = "Hostels";
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }, // Delay each letter for the typewriter effect
    }),
  };

  // Colors for hotel ribbon
  const hotelRibbonColor = "#a31c44";
  const hotelRibbonTextColor = "#fff";

  // Colors for hostel ribbon
  const hostelRibbonColor = "#454F61";
  const hostelRibbonTextColor = "#fff";

  return (
    <div className="hidden md:flex flex-1 flex-col md:flex-row relative h-screen">
      <AnimatePresence>
        {!expandedSection && (
          <motion.div
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="w-12 h-12 -ml-6 flex items-center justify-center text-white hover:scale-110 transition-transform"
              onClick={() => handleSectionClick("hostels")}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="w-12 h-12 -mr-6 flex items-center justify-center text-white hover:scale-110 transition-transform"
              onClick={() => handleSectionClick("hotels")}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Hotel Section - Left */}
        <motion.section
          key="hotels"
          className="w-full md:w-1/2 bg-gradient-to-b from-[#A31C44] to-[#7A1533] text-white relative overflow-hidden cursor-pointer"
          variants={sectionVariants}
          initial="initial"
          animate={
            expandedSection === "hotels"
              ? "expanded"
              : expandedSection === "hostels"
              ? "collapsed"
              : "animate"
          }
          exit="exit"
          onClick={() => handleSectionClick("hotels")}
        >
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 to-transparent">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={nextHotelImage}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={hotelImages[nextHotelImage] || "/placeholder.svg"}
                  alt="Luxury Hotel Room"
                  fill
                  className="object-cover opacity-30 mix-blend-overlay"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0">
              <Image
                src={hotelImages[currentHotelImage] || "/placeholder.svg"}
                alt="Luxury Hotel Room"
                fill
                className="object-cover opacity-30 mix-blend-overlay"
              />
            </div>
          </div>
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-between h-full">
            {(!expandedSection || expandedSection === "hotels") && (
              <>
                <div className="my-auto py-12">

                  {/* Typewriter Effect for "Hostels" using Framer Motion */}
                  <div className="text-5xl font-semibold text-white flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: [0, `${text.length}ch`], 
                        transition: {
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 1,
                          ease: "easeInOut",
                        }
                      }}
                      className="overflow-hidden whitespace-nowrap mb-6"
                    >
                      {text}
                    </motion.div>
                      <motion.span
                      animate={{ 
                        opacity: [1, 0], 
                        transition: {
                          duration: 0.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut"
                        }
                      }}
                    >
                      |
                      </motion.span>
                  </div>

                  <motion.h2
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    {["LUXURY", "COMFORT", "STYLE"].map((word, index) => (
                      <motion.div key={index} className="overflow-hidden">
                        <motion.span
                          className="inline-block"
                          variants={textRevealVariants}
                          custom={index}
                        >
                          {word}
                        </motion.span>
                      </motion.div>
                    ))}
                  </motion.h2>

                  <motion.p
                    className="mb-8 max-w-md text-white/90 text-sm sm:text-base"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Experience unparalleled luxury in our handpicked selection
                    of premium hotels. Indulge in exceptional service and
                    amenities designed for the discerning traveler.
                  </motion.p>

                  {expandedSection === "hotels" && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="flex justify-left mt-16"
                    >
                      <NewButton
                        variant="neutral"
                        className="btn-hotel rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscover("hotels");
                        }}
                      >
                        Discover hotels{" "}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </NewButton>
                    </motion.div>
                  )}
                </div>
              </>
            )}
            {expandedSection === "hostels" && (
              <motion.div
                className="h-full flex items-center justify-center cursor-pointer absolute inset-0 z-[-1] overflow-visible"
                initial={{ opacity: 0, scale: 0.8, x: "100%" }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: "0",
                  zIndex: 10,
                  transition: {
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                    x: {
                      duration: 1.2,
                      ease: [0.16, 1, 0.3, 1],
                      times: [0, 0.1, 0.2, 0.3, 0.4, 1],
                      values: ["100%", "130%", "90%", "120%", "80%", "0"]
                    }
                  }
                }}
                exit={{ opacity: 0, scale: 0.8, x: "100%", zIndex: -1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSectionClick("hotels");
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 pr-8">
                  <div 
                    className="ribbon ribbon-right"
                    style={{
                      '--r': '1.8em',
                      '--color': hotelRibbonColor,
                      '--text-color': hotelRibbonTextColor,
                    } as React.CSSProperties}
                  >
                    <span className="text-xl font-bold">Switch to Hotels</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Hostel Section - Right */}
        <motion.section
          key="hostels"
          className="w-full md:w-1/2 bg-gradient-to-b from-[#343F52] to-[#1A1B1E] text-white relative overflow-hidden cursor-pointer"
          variants={sectionVariants}
          initial="initial"
          animate={
            expandedSection === "hostels"
              ? "expanded"
              : expandedSection === "hotels"
              ? "collapsed"
              : "animate"
          }
          exit="exit"
          onClick={() => handleSectionClick("hostels")}
        >
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 to-transparent">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={nextHostelImage}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={hostelImages[nextHostelImage] || "/placeholder.svg"}
                  alt="Vibrant Hostel Room"
                  fill
                  className="object-cover opacity-30 mix-blend-overlay"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0">
              <Image
                src={hostelImages[currentHostelImage] || "/placeholder.svg"}
                alt="Vibrant Hostel Room"
                fill
                className="object-cover opacity-30 mix-blend-overlay"
              />
            </div>
          </div>
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-between h-full">
            {(!expandedSection || expandedSection === "hostels") && (
              <>
                <div className="my-auto py-12">
                <div className="text-5xl font-semibold text-white flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: [0, `${textHostel.length}ch`], 
                        transition: {
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 1,
                          ease: "easeInOut",
                        }
                      }}
                      className="overflow-hidden whitespace-nowrap mb-6"
                    >
                      {textHostel}
                    </motion.div>
                      <motion.span
                      animate={{ 
                        opacity: [1, 0], 
                        transition: {
                          duration: 0.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut"
                        }
                      }}
                    >
                      |
                      </motion.span>
                  </div>
                  <motion.h2
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    {["VIBRANT", "SOCIAL", "AFFORDABLE"].map((word, index) => (
                      <motion.div key={index} className="overflow-hidden">
                        <motion.span
                          className="inline-block"
                          variants={textRevealVariants}
                          custom={index}
                        >
                          {word}
                        </motion.span>
                      </motion.div>
                    ))}
                  </motion.h2>
                  <motion.p
                    className="mb-8 max-w-md text-white/90"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Connect with fellow travelers in our vibrant hostels. Enjoy
                    budget-friendly accommodations without compromising on
                    experience or location.
                  </motion.p>
                  {expandedSection === "hostels" && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="flex justify-left mt-16"
                    >
                      <NewButton
                        variant="neutral"
                        className="btn-hostel rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscover("hostels");
                        }}
                      >
                        Discover hostels{" "}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </NewButton>
                    </motion.div>
                  )}
                </div>
              </>
            )}
            {expandedSection === "hotels" && (
              <motion.div
                className="h-full flex items-center justify-center cursor-pointer absolute inset-0 z-[-1] overflow-visible"
                initial={{ opacity: 0, scale: 0.8, x: "-100%" }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: "0%",
                  zIndex: 10,
                  transition: {
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                    x: {
                      duration: 1.2,
                      ease: [0.16, 1, 0.3, 1],
                      times: [0, 0.1, 0.2, 0.3, 0.4, 1],
                      values: ["-100%", "-130%", "-90%", "-120%", "-80%", "0%"]
                    }
                  }
                }}
                exit={{ opacity: 0, scale: 0.8, x: "-100%", zIndex: -1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSectionClick("hostels");
                }}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 pl-4">
                  <div 
                    className="ribbon ribbon-left"
                    style={{
                      '--r': '1.8em',
                      '--color': hostelRibbonColor,
                      '--text-color': hostelRibbonTextColor,
                    } as React.CSSProperties}
                  >
                    <span className="text-xl font-bold">Switch to Hostels</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
