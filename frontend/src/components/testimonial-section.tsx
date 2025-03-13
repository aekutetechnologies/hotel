"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

export default function TestimonialSection({ testimonials, theme }: any) {
  const [activeIndex, setActiveIndex] = useState(0)
  const testimonialRefs = useRef<(HTMLDivElement | null)[]>([])

  // Theme colors
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
      primary: "bg-[#2A2B2E]",
      secondary: "bg-[#1A1B1E]",
      accent: "text-[#2A2B2E]",
      light: "bg-[#D1D2D4]",
      text: "text-[#E8E9F1]",
      buttonText: "text-[#2A2B2E]",
      starActive: "text-white",
      starInactive: "text-[#2A2B2E]",
    },
  }

  // Map 'hotel' to 'maroon' and 'hostel' to 'grey'
  const themeMap: { [key: string]: keyof typeof themeColors } = {
    hotel: "maroon",
    hostel: "grey",
  }

  // Get background image based on theme
  const getBackgroundImage = () => {
    if (theme === "hotel") {
      return "/images/hotels/hotel_1.webp"
    } else {
      return "/images/hostels/hostel_1.jpg"
    }
  }

  const selectedTheme = themeMap[theme] || "grey" // Default to 'grey' if theme is not recognized
  const colors = themeColors[selectedTheme]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = testimonialRefs.current.findIndex((ref) => ref === entry.target)
            if (index !== -1) {
              setActiveIndex(index)
            }
          }
        })
      },
      { threshold: 0.7 }, // When 70% of the element is visible
    )

    testimonialRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      testimonialRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  return (
    <div className="p-6 md:p-8 bg-white rounded-3xl max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="relative h-full min-h-[400px] md:min-h-[600px] flex flex-col">
            {/* Background Image */}
            <Image
              src={getBackgroundImage()}
              alt={theme === "hotel" ? "Luxury hotel interior" : "Vibrant hostel space"}
              fill
              className="object-cover z-0"
              priority
            />

            {/* Overlay with theme gradient */}
            <div className={`absolute inset-0 z-0 opacity-60 ${colors?.primary}`}></div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col justify-between h-full p-8 text-white">
              {/* Heading */}
              <div className="max-w-[300px]">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  {theme === "hotel" 
                    ? "Experience What Our Guests Love" 
                    : "Hear From Fellow Travelers"} 
                  <span className="text-3xl">❤️</span>
                </h2>
              </div>

              {/* Counter */}
              <div className="mt-auto mb-16">
                <p className="text-6xl md:text-7xl font-bold">10.9K+</p>
                <p className="text-xl opacity-90">Happy guests</p>
              </div>

              {/* CTA */}
              <div className={`${colors?.secondary} p-4 rounded-xl -mx-8 -mb-8`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl md:text-3xl font-semibold">Are you the next one?</h3>
                  <button className={`bg-white ${colors?.buttonText} px-4 py-2 rounded-lg font-medium`}>
                    {theme === "hotel" ? "Book Now" : "Join Us"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Testimonials */}
        <div
          className={`flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 testimonial-scroll`}
        >
          {testimonials?.map((testimonial: any, index: number) => (
            <div
              key={index}
              ref={(el) => (testimonialRefs.current[index] = el)}
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
                <div className={`p-1 rounded-full ${index === activeIndex ? colors?.secondary : "bg-gray-200"}`}>
                  <ArrowUpRight className={`h-4 w-4 ${index === activeIndex ? "text-white" : colors?.accent}`} />
                </div>
              </div>
              <p className="text-sm md:text-base mb-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold">{testimonial.author?.name}</p>
                  <p className={`text-sm ${index === activeIndex ? colors?.text : "text-gray-600"}`}>
                    {testimonial.author?.handle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

