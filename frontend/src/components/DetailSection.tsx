/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import AddNavbar from "@/components/AddNavbar";
import Navbar from "@/components/Navbar";
import PlaceCard from "@/components/PlaceCard";
import { PropertyTimeline } from "@/components/property-timeline";
import Features from "@/components/Features";
import SocialSection from "@/components/SocialSection";
import TestimonialSection from "@/components/testimonial-section";
import { HeroSection } from "./HeroSection";
import Footer from "./Footer";
import { usePathname } from "next/navigation";

interface DetailSectionProps {
  sectionType: "hotels" | "hostels";
  isLoggedIn: boolean;
  userName: string;
  onClose: (e: React.MouseEvent<HTMLDivElement>) => void;
  hotelTestimonials: any[];
  hostelTestimonials: any[];
  handleLoginClick: (e?: React.MouseEvent) => void;
  setShowDetailSection: (section: "hotels" | "hostels" | null) => void;
}

const detailSectionVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export function DetailSection({
  sectionType,
  isLoggedIn,
  userName,
  onClose,
  hotelTestimonials,
  hostelTestimonials,
  setShowDetailSection,
  handleLoginClick,
}: DetailSectionProps) {
  const detailSectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  
  // Value for shine animation
  const shineAngle = useMotionValue(15);
  
  // Make the shine angle update based on scroll
  useEffect(() => {
    const unsubscribeY = scrollY.onChange(latest => {
      // Cycle the shine angle based on scroll position
      shineAngle.set((latest % 200) / 5);
    });
    
    return () => {
      unsubscribeY();
    };
  }, [scrollY, shineAngle]);
  
  // Rotate the sticker based on scroll
  const rotate = useTransform(scrollY, [0, 1000], [0, 360]);
  
  // Spring animation for smoother rotation
  const springRotate = useSpring(rotate, { damping: 20, stiffness: 100 });

  // Helper to convert the section type from "hotels"/"hostels" to "hotel"/"hostel"
  const getSingularType = (type: "hotels" | "hostels"): "hotel" | "hostel" => {
    return type === "hotels" ? "hotel" : "hostel";
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear()
    
    // Redirect to home page (reload)
    window.location.href = "/"
  };

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem("access_token", userData.access_token);
    localStorage.setItem("user_role", userData.user_role);
    localStorage.setItem("name", userData.name);
    localStorage.setItem("id", userData.id.toString());
    localStorage.setItem("permissions", JSON.stringify(userData.permissions));
  };

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedAccessToken = localStorage.getItem("access_token");
    if (storedName && storedAccessToken) {
      // Assuming props are used to manage state externally
      // setIsLoggedIn(true);
      // setUserName(storedName);
    }
  }, []);

  const [isClosed, setIsClosed] = useState(true);
  const pathname = usePathname();

  const scrollToTop = () => {
    console.log("Scrolling to top");
    
    // Try multiple selector approaches to ensure we find the right element
    // First try our specific content container
    const contentElement = document.querySelector('.overflow-y-auto.h-full.scrollbar-hide');
    
    if (contentElement) {
      contentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // Try the main detail section container
    if (detailSectionRef.current) {
      detailSectionRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // Fallback to window scroll as a last resort
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Additionally, try to focus the search form if it exists
    setTimeout(() => {
      const searchForm = document.querySelector('form');
      if (searchForm) {
        const firstInput = searchForm.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }, 800); // Allow time for the scroll to complete
  };

  // Create a pulse animation
  const [isPulsing, setIsPulsing] = useState(false);
  
  useEffect(() => {
    // Start pulsing animation after delay
    const pulseTimer = setTimeout(() => {
      setIsPulsing(true);
    }, 3000);
    
    return () => clearTimeout(pulseTimer);
  }, []);

  // Themed colors based on section type
  const primaryColor = sectionType === "hotels" ? "#A31C44" : "#343F52";
  const accentColor = sectionType === "hotels" ? "#FF3A5E" : "#475569";
  const borderColor = sectionType === "hotels" ? "#FF9BAC" : "#64748B";

  // Handle navModal state change from Navbar
  const handleNavModalChange = (isOpen: boolean) => {
    setIsNavModalOpen(isOpen);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Book Now Sticker - Only visible when navModal is closed */}
      {!isNavModalOpen && (
        <motion.div 
          className="fixed right-8 top-1/2 z-[60] transform -translate-y-1/2"
          initial={{ opacity: 0, scale: 0, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ 
            delay: 2, 
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from bubbling to parent
            scrollToTop();
          }}
        >
          <motion.div 
            className="relative cursor-pointer w-auto"
            style={{ rotate: springRotate }}
            animate={isPulsing ? { 
              scale: [1, 1.05, 1],
              transition: { 
                repeat: Infinity, 
                repeatType: "loop", 
                duration: 2,
                ease: "easeInOut" 
              }
            } : {}}
            whileHover={{ scale: 1.1, rotate: [null, -10, 10, 0] }}
            whileTap={{ scale: 0.9 }}
          >
            {/* The sticker text with styling */}
            <div 
              className="sticker relative text-center" 
              style={{
                fontFamily: "'Arial', sans-serif",
                fontStyle: "italic",
                fontWeight: 900,
                fontSize: "36px", 
                lineHeight: "0.9",
                textTransform: "uppercase",
                padding: "8px",
              }}
            >
              {/* Themed gradient text with enhanced shine effect */}
              <motion.div
                animate={{ 
                  textShadow: isPulsing ? [
                    "0.05em 0.05em 0.02em rgba(0,0,0,0.5)",
                    "0.07em 0.07em 0.03em rgba(0,0,0,0.7)",
                    "0.05em 0.05em 0.02em rgba(0,0,0,0.5)"
                  ] : "0.05em 0.05em 0.02em rgba(0,0,0,0.5)",
                  transition: { 
                    repeat: Infinity, 
                    duration: 2 
                  }
                }}
                style={{
                  backgroundImage: `
                    linear-gradient(
                      ${shineAngle}deg, 
                      rgba(255,255,255,0) 0%, 
                      rgba(255,255,255,0) 40%, 
                      rgba(255,255,255,0.98) 49.5%, 
                      rgba(255,255,255,0.98) 50.5%, 
                      rgba(255,255,255,0) 60%, 
                      rgba(255,255,255,0)
                    ),
                    linear-gradient(
                      to right, 
                      ${primaryColor}, 
                      ${accentColor}, 
                      ${primaryColor}, 
                      ${accentColor}, 
                      ${primaryColor}
                    )
                  `,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0.05em 0.05em 0.02em rgba(0,0,0,0.5)",
                  position: "relative",
                  zIndex: 2,
                  display: "inline-block",
                  transform: "rotate(-8deg)",
                }}
              >
                BOOK<br/>NOW
              </motion.div>
              
              {/* White outline behind text */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  WebkitTextStroke: `0.15em ${borderColor}`,
                  color: "transparent",
                  fontFamily: "inherit",
                  fontStyle: "inherit",
                  fontWeight: "inherit",
                  fontSize: "inherit",
                  lineHeight: "inherit",
                  textTransform: "inherit",
                  zIndex: 1,
                  transform: "rotate(-8deg)",
                }}
              >
                BOOK<br/>NOW
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        ref={detailSectionRef}
        className="absolute inset-x-0 top-0 bottom-0 bg-white text-black overflow-y-auto shadow-2xl scrollbar-hide max-w-[100vw]"
        variants={{
          hidden: { y: "100%" },
          visible: { y: 0 },
          exit: { y: "100%" },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Fixed position navbars */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full">
          {/* Add Navbar at the top */}
          {isClosed && (
            <div className="w-full">
              <AddNavbar
                type={getSingularType(sectionType)}
                onClose={() => setIsClosed(false)}
              />
            </div>
          )}
          
          {/* Main Navbar below */}
          <div className="w-full">
            <Navbar
              isLoggedIn={isLoggedIn}
              userName={userName}
              handleLogout={handleLogout}
              handleLoginClick={handleLoginClick}
              setShowDetailSection={(section: string) => {
                setShowDetailSection(section as "hotels" | "hostels" | null);
              }}
              isClosed={isClosed}
              currentSection={getSingularType(sectionType)}
              onNavModalChange={handleNavModalChange}
              isDetailPage={true}
            />
          </div>
        </div>

        {/* Content with appropriate top margin */}
        <div 
          className="overflow-y-auto h-full scrollbar-hide" 
          style={{ 
            marginTop: isClosed ? '110px' : '70px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Hero Section with Search */}
          <HeroSection sectionType={sectionType} />

          {/* Place Cards - further reducing vertical spacing with larger negative margin */}
          <div className="mt-[-8rem]">
            <PlaceCard type={getSingularType(sectionType)} />
          </div>

          {/* Property Timeline */}
          <div className="bg-white w-full mt-[-4rem]">
            <PropertyTimeline type={getSingularType(sectionType)} />
          </div>

          {/* Features */}
          <Features sectionType={sectionType} />

          {/* Social Section */}
          <SocialSection type={getSingularType(sectionType)} />

          {/* Reviews Section */}
          <div className="py-16 bg-white">
            <TestimonialSection
              testimonials={
                sectionType === "hotels"
                  ? hotelTestimonials
                  : hostelTestimonials
              }
              theme={getSingularType(sectionType)}
            />
          </div>

          {/* Footer */}
          <Footer sectionType={sectionType} />
        </div>
      </motion.div>
      
    </motion.div>
  );
}
