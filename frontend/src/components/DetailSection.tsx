"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import AddNavbar from "@/components/AddNavbar"
import Navbar from "@/components/Navbar"
import PlaceCard from "@/components/PlaceCard"
import { PropertyTimeline } from "@/components/property-timeline"
import Features from "@/components/Features"
import SocialSection from "@/components/SocialSection"
import TestimonialSection from "@/components/testimonial-section"
import { HeroSection } from "./HeroSection"

interface DetailSectionProps {
  sectionType: "hotels" | "hostels"
  isLoggedIn: boolean
  userName: string
  onClose: (e: React.MouseEvent<HTMLDivElement>) => void
  hotelTestimonials: any[]
  hostelTestimonials: any[]
}

const detailSectionVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
}

export function DetailSection({
  sectionType,
  isLoggedIn,
  userName,
  onClose,
  hotelTestimonials,
  hostelTestimonials,
}: DetailSectionProps) {
  const detailSectionRef = useRef<HTMLDivElement>(null)

  // Helper to convert the section type from "hotels"/"hostels" to "hotel"/"hostel"
  const getSingularType = (type: "hotels" | "hostels"): "hotel" | "hostel" => {
    return type === "hotels" ? "hotel" : "hostel"
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={detailSectionRef}
        className="absolute inset-x-0 top-0 bottom-0 bg-white text-black overflow-y-hidden shadow-2xl scrollbar-hide"
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
      >
        <AddNavbar />
        <Navbar isLoggedIn={isLoggedIn} userName={userName} />
        
        <div className="overflow-y-auto h-full scrollbar-hide mt-16">
          {/* Hero Section with Search */}
          <HeroSection sectionType={sectionType} />

          {/* Place Cards */}
          <PlaceCard type={getSingularType(sectionType)} />

          {/* Property Timeline */}
          <div className="bg-white w-full">
            <PropertyTimeline type={getSingularType(sectionType)} />
          </div>

          {/* Features */}
          <Features />
          
          {/* Social Section */}
          <SocialSection />
          
          {/* Reviews Section */}
          <div className="py-16 bg-white">
            <TestimonialSection
              testimonials={sectionType === "hotels" ? hotelTestimonials : hostelTestimonials}
              theme={getSingularType(sectionType)}
            />
          </div>

          {/* Footer */}
          <footer
            className={`text-white py-12 ${sectionType === "hotels" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"}`}
          >
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-8"
              >
                <div>
                  <h4 className="font-bold mb-4">About Us</h4>
                  <p className="text-gray-300">
                    {sectionType === "hotels"
                      ? "Discover luxury and comfort with our carefully curated selection of premium hotels."
                      : "Experience vibrant and affordable stays with our network of social hostels."}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>{sectionType === "hotels" ? "Hotels" : "Hostels"}</li>
                    <li>Locations</li>
                    <li>Special Offers</li>
                    <li>Contact Us</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Contact</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>Email: info@hsquare.com</li>
                    <li>Phone: +1 234 567 890</li>
                    <li>Address: 123 Travel Street</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Newsletter</h4>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="px-4 py-2 rounded-l-md flex-1 text-gray-900"
                    />
                    <button
                      className={`px-4 py-2 rounded-r-md transition-colors ${
                        sectionType === "hotels"
                          ? "bg-[#7A1533] hover:bg-[#5A0F23]"
                          : "bg-[#1A1B1E] hover:bg-[#0A0B0E]"
                      }`}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              </motion.div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
                <p>&copy; 2024 HSquare. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  )
} 