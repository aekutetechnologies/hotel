"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TestimonialSection({ testimonials, theme }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDuration = 8000; // Increased from 4000ms to 8000ms for slower scrolling
  const detailSectionRef = useRef<HTMLDivElement>(null);

  const themeColors = {
    maroon: {
      primary: "bg-[#A31C44]",
      secondary: "bg-[#7A1533]",
      accent: "text-[#A31C44]",
      light: "bg-[#FFD4DE]",
      text: "text-[#FFE5EB]",
      buttonText: "text-[#A31C44]",
      starActive: "text-white",
      starInactive: "text-[#A31C44]",
    },
    grey: {
      primary: "bg-[#A31C44]",
      secondary: "bg-[#1A1B1E]",
      accent: "text-[#A31C44]",
      light: "bg-[#D1D2D4]",
      text: "text-[#E8E9F1]",
      buttonText: "text-[#A31C44]",
      starActive: "text-white",
      starInactive: "text-[#A31C44]",
    },
  };

  const themeMap: { [key: string]: keyof typeof themeColors } = {
    hotel: "maroon",
    hostel: "grey",
  };

  const getBackgroundImage = () => {
    return theme === "hotel"
      ? "/images/hotels/hotel_1.webp"
      : "/images/hostels/hostel_1.jpg";
  };

  const selectedTheme = themeMap[theme] || "grey";
  const colors = themeColors[selectedTheme];

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Auto-scroll with increased interval for slower scrolling
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, scrollDuration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testimonials.length, scrollDuration]);

  // Pause scrolling on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, scrollDuration);
  };

  // Scroll to top of page for "Book Now"
  const scrollToTop = () => {
    // Find the main content container in DetailSection with the updated structure
    const contentElement = document.querySelector('.overflow-y-auto.h-full.scrollbar-hide');
    if (contentElement) {
      contentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (detailSectionRef.current) {
      // Fallback to the main container
      detailSectionRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Last resort fallback to window scroll
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-3xl max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="relative h-full min-h-[400px] md:min-h-[600px] flex flex-col">
            <Image
              src={getBackgroundImage()}
              alt={theme === "hotel" ? "Luxury hotel interior" : "Vibrant hostel space"}
              fill
              className="object-cover z-0"
              priority
            />

            <div className={`absolute inset-0 z-0 opacity-60 ${colors?.primary}`} />

            <div className="relative z-10 flex flex-col justify-between h-full p-8 text-white">
              <div className="max-w-[300px]">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  {theme === "hotel" ? "Experience What Our Guests Love" : "Hear From Fellow Travelers"}{" "}
                  <span className="text-3xl">❤️</span>
                </h2>
              </div>

              <div className="mt-auto mb-16">
                <p className="text-6xl md:text-7xl font-bold">1.2K+</p>
                <p className="text-xl opacity-90">Happy guests</p>
              </div>

              <div className={`${colors?.secondary} p-4 rounded-xl -mx-8 -mb-8`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  {isLoggedIn ? (
                    <>
                      <h3 className="text-xl md:text-2xl font-semibold">Share your experience</h3>
                      <Link href="/booking">
                        <Button 
                          className={`text-white bg-white hover:bg-opacity-90 whitespace-nowrap ${colors?.accent}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Add Review
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl md:text-2xl font-semibold">Are you the next one?</h3>
                      <Button 
                        onClick={scrollToTop}
                        className={`text-white bg-white hover:bg-opacity-90 whitespace-nowrap ${colors?.accent}`}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Testimonials */}
        <div
          className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 testimonial-scroll"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {testimonials?.map((testimonial: any, index: number) => (
            <div
              key={index}
              ref={(el) => {
                testimonialRefs.current[index] = el;
              }}
              className={`p-6 rounded-2xl relative transition-colors duration-300 ${
                index === activeIndex ? `${colors?.primary} text-white` : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={index === activeIndex ? colors?.starActive : colors?.starInactive}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm md:text-base mb-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold">{testimonial.author?.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
