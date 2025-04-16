import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaLinkedin,
  FaWifi,
  FaBed,
  FaUtensils,
  FaShower,
  FaSwimmingPool,
  FaCoffee,
  FaCocktail,
  FaDumbbell,
  FaSpa,
  FaParking,
  FaBriefcase,
  FaTaxi,
  FaConciergeBell,
  FaSnowflake,
  FaLock,
  FaUsers,
  FaBaby,
  FaAccessibleIcon,
  FaTv,
  FaBroom,
  FaIdCard,
  FaThermometerHalf,
  FaWind,
  FaKey,
  FaTimes,
  FaMapPin,
  FaWallet,
  FaGlassCheers,
  FaCompass,
} from "react-icons/fa";
import Image from "next/image";
// import img1 from "/public/images/social/img1.jpeg";
import img2 from "/public/images/social/img2.jpeg";
import img3 from "/public/images/social/img3.jpeg";
import img4 from "/public/images/social/img4.jpeg";
import img5 from "/public/images/social/img5.jpeg";
// import img6 from "/public/images/social/img6.jpeg";
import esc from "/public/images/social/esc.jpg";
import hsqure from "/public/images/social/hsqure.jpg";
import hoteldayss from "/public/images/social/hotel_dayss.png";
import hosteldayss from "/public/images/social/hostel_dayss.png";

import socialh1 from "/public/images/social/socialh1.jpg";
import socialh2 from "/public/images/social/socialh2.jpg";
import socialh3 from "/public/images/social/socialh3.jpg";
import socialh4 from "/public/images/social/socialh4.jpg";
import socialh5 from "/public/images/social/socialh5.jpg";
import socialh6 from "/public/images/social/socialh6.jpg";

// Define amenity information for each image
const hostelAmenities = [
  {
    title: "Common Areas",
    description: "Vibrant social spaces where travelers can connect and share experiences",
    features: ["Community Lounge", "Co-working Space", "Game Room", "Outdoor Patio"],
    icons: [FaUsers, FaBriefcase, FaTv, FaCoffee]
  },
  {
    title: "Secure Accommodations",
    description: "Safe and comfortable sleeping options for budget-conscious travelers",
    features: ["Electronic Lockers", "24/7 Security", "Keycard Access", "Individual Reading Lights"],
    icons: [FaLock, FaKey, FaIdCard, FaLock]
  },
  {
    title: "Budget-Friendly Facilities",
    description: "Essential amenities to make your stay comfortable without breaking the bank",
    features: ["Free WiFi", "Communal Kitchen", "Laundry Facilities", "Luggage Storage"],
    icons: [FaWifi, FaUtensils, FaBroom, FaBriefcase]
  },
  {
    title: "Social Experiences",
    description: "Organized activities to help you meet fellow travelers",
    features: ["City Tours", "Pub Crawls", "Movie Nights", "Cultural Exchanges"],
    icons: [FaTaxi, FaCocktail, FaTv, FaUsers]
  },
  {
    title: "Basic Comforts",
    description: "Simple but essential amenities for a pleasant stay",
    features: ["Hot Showers", "Heating/AC", "Clean Linens", "Daily Housekeeping"],
    icons: [FaShower, FaThermometerHalf, FaBed, FaBroom]
  },
  {
    title: "Practical Services",
    description: "Helpful services to make your travel easier",
    features: ["Tourist Information", "Bike Rental", "Airport Transfers", "24/7 Reception"],
    icons: [FaIdCard, FaBriefcase, FaTaxi, FaConciergeBell]
  }
];

const hotelAmenities = [
  {
    title: "Luxurious Accommodations",
    description: "Premium rooms and suites designed for ultimate comfort and relaxation",
    features: ["King-Size Beds", "Premium Linens", "Pillow Menu", "Blackout Curtains"],
    icons: [FaBed, FaBed, FaBed, FaWind]
  },
  {
    title: "Fine Dining Options",
    description: "Exceptional culinary experiences from world-class chefs",
    features: ["Gourmet Restaurant", "Room Service", "Breakfast Buffet", "Cocktail Lounge"],
    icons: [FaUtensils, FaConciergeBell, FaCoffee, FaCocktail]
  },
  {
    title: "Wellness Facilities",
    description: "Comprehensive amenities to rejuvenate mind and body",
    features: ["Spa Services", "Fitness Center", "Swimming Pool", "Sauna & Steam Room"],
    icons: [FaSpa, FaDumbbell, FaSwimmingPool, FaThermometerHalf]
  },
  {
    title: "Business Services",
    description: "Full range of amenities for the business traveler",
    features: ["Conference Rooms", "Business Center", "High-Speed WiFi", "Secretarial Services"],
    icons: [FaBriefcase, FaBriefcase, FaWifi, FaConciergeBell]
  },
  {
    title: "Premium Comforts",
    description: "Thoughtful touches for an exceptional stay",
    features: ["Climate Control", "Smart TV", "Electronic Safe", "Minibar"],
    icons: [FaSnowflake, FaTv, FaLock, FaCocktail]
  },
  {
    title: "Exclusive Services",
    description: "Personalized attention for a seamless experience",
    features: ["Concierge Service", "Valet Parking", "Airport Shuttle", "Childcare"],
    icons: [FaConciergeBell, FaParking, FaTaxi, FaBaby]
  }
];

const hostelImg = [hsqure, esc, img3, img4, img5, img2];
const hotelImg = [socialh1, socialh2, socialh3, socialh4, socialh5, socialh6];

interface socialSectionProps {
  type: "hotel" | "hostel";
}

const SocialSection = ({ type = "hotel" }: socialSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  const images = type === "hotel" ? hotelImg : hostelImg;
  const amenities = type === "hotel" ? hotelAmenities : hostelAmenities;
  const themeColor = type === "hotel" ? "#A31C44" : "#2A2B2E";
  const accentColor = type === "hotel" ? "#FF9BAC" : "#3bf0c1";
  
  const openPopup = (index: number) => {
    setSelectedImage(index);
  };
  
  const closePopup = () => {
    setSelectedImage(null);
  };

  return (
    // <div className=" w-full text-black flex flex-col gap-10 py-1 my-20 bg-gradient-to-r from-[#bfa8af] via-[#b95372] to-[#7A1533]">
    <div
      className={` w-full text-white flex flex-col gap-10 py-5 my-20  ${
        type === "hotel" ? "bg-[#A31C44]" : "bg-[#2A2B2E]"
      }`}
    >
      {/* Title */}
      <div className="p-4">
        {/* {type === "hostel" && (
          <h1
            className={`text-center text-8xl font-bold ${
              isHovered ? "text-[#A31C44]" : "text-white"
            }`}
          >
            Explore, Share, Connect
          </h1>
        )} */}
      </div>

      {/* Image Grid & Subscribe Section */}
      <div className="flex justify-evenly items-center flex-col md:flex-row gap-10 mx-4 md:mx-20">
        {/* Image Grid */}
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <motion.div
              key={index}
              className="h-[250px] overflow-hidden rounded-lg border-2"
              style={{ borderColor: accentColor }}
              whileHover={{
                scale: 1.05,
                filter: "grayscale(0%)",
                transition: { duration: 0.3 },
              }}
              initial={{ filter: "grayscale(30%)" }}
              onClick={() => openPopup(index)}
            >
              <div className="relative w-full h-full cursor-pointer">
                <Image
                  src={img}
                  alt={`${type === "hotel" ? "Hotel" : "Hostel"} Amenity`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                  <h3 className="text-white font-bold text-lg">
                    {amenities[index]?.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Subscribe & Social Media Section */}
        <div className="w-full md:w-1/3 flex flex-col mt-0 items-center gap-5 justify-evenly">
          {/* Replace the images with animated "Why Love Hsquare" section */}
          <motion.div 
            className="w-full px-8 py-10 rounded-xl flex flex-col items-center relative overflow-visible"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Floating Background Elements */}
            <motion.div
              className="absolute w-32 h-32 rounded-full"
              style={{ background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`, left: '-10%', top: '10%' }}
              animate={{
                x: [0, 10, 0],
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            
            <motion.div
              className="absolute w-24 h-24 rounded-full"
              style={{ background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`, right: '-5%', bottom: '15%' }}
              animate={{
                x: [0, -15, 0],
                y: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5,
              }}
            />
            
            {/* Heading with character animation */}
            <motion.div 
              className="overflow-visible relative mb-8 px-6 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap items-center justify-center whitespace-nowrap overflow-visible mx-auto max-w-full">
                {/* Combined "Why" and "Hsquare" text in one container to prevent separation */}
                <div className="inline-flex items-center justify-center flex-nowrap overflow-visible px-4 py-3 mx-auto max-w-full">
                  {/* "Why" Text */}
                  <motion.div className="text-3xl sm:text-4xl md:text-5xl font-bold overflow-visible">
                    {"Why".split("").map((char, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                        className="inline-block overflow-visible px-[1px]"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>
                  
                  {/* Heart Animation (smaller size) */}
                  <motion.div 
                    className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-2 flex-shrink-0"
                    initial={{ y: 0 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      className="absolute w-full h-full"
                      style={{ 
                        filter: `drop-shadow(0 0 8px ${accentColor}66)`,
                        zIndex: 0,
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <motion.path
                          d="M50 30C35 10 10 20 10 40C10 75 50 90 50 90C50 90 90 75 90 40C90 20 65 10 50 30Z"
                          fill={`${accentColor}44`}
                        />
                      </svg>
                    </motion.div>
                    
                    <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                      <motion.path
                        d="M50 30C35 10 10 20 10 40C10 75 50 90 50 90C50 90 90 75 90 40C90 20 65 10 50 30Z"
                        fill="none"
                        stroke={accentColor}
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ 
                          duration: 1.5, 
                          ease: "easeInOut", 
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 0.5
                        }}
                      />
                    </svg>
                  </motion.div>
                  
                  {/* "Hsquare" Text */}
                  <motion.div className="text-3xl sm:text-4xl md:text-5xl font-bold overflow-visible">
                    {"Hsquare".split("").map((char, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.5 + (index * 0.05),
                          ease: "easeOut"
                        }}
                        className="inline-block overflow-visible px-[1px]"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Animated Feature Cards */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {type === "hotel" ? (
                <>
                  <FeatureCard 
                    icon={FaBed}
                    title="Luxury Comfort" 
                    index={0} 
                    accentColor={accentColor}
                  />
                  <FeatureCard 
                    icon={FaConciergeBell}
                    title="Premium Service" 
                    index={1} 
                    accentColor={accentColor}
                  />
                  <FeatureCard 
                    icon={FaUtensils}
                    title="Fine Dining" 
                    index={2} 
                    accentColor={accentColor}
                  />
                  <FeatureCard 
                    icon={FaMapPin}
                    title="Prime Locations" 
                    index={3} 
                    accentColor={accentColor}
                  />
                </>
              ) : (
                <>
                  <FeatureCard 
                    icon={FaUsers}
                    title="Community" 
                    index={0} 
                    accentColor={accentColor}
                  />
                  <FeatureCard 
                    icon={FaWallet}
                    title="Affordable" 
                    index={1} 
                    accentColor={accentColor}
                  />
                  <FeatureCard 
                    icon={FaGlassCheers}
                    title="Social Events" 
                    index={2} 
                    accentColor={accentColor}
                  />
                  <FeatureCard 
                    icon={FaCompass}
                    title="Local Insights" 
                    index={3} 
                    accentColor={accentColor}
                  />
                </>
              )}
            </motion.div>
          </motion.div>

          <p className="text-xl text-center max-w-md leading-relaxed">
            Discover the exceptional amenities and services available at our {type === "hotel" ? "luxury hotels" : "vibrant hostels"}. We provide everything you need for a comfortable and memorable stay.
          </p>
        </div>
      </div>
      
      {/* Image Popup */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          >
            <motion.div
              className="relative w-[90%] max-w-4xl bg-white rounded-xl overflow-hidden text-black"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md"
                onClick={closePopup}
              >
                <FaTimes className="text-gray-800" size={20} />
              </button>
              
              <div className="flex flex-col md:flex-row">
                {/* Image section */}
                <div className="w-full md:w-1/2 h-[300px] md:h-[400px] relative">
                  <Image 
                    src={images[selectedImage]} 
                    alt={amenities[selectedImage]?.title || "Amenity"} 
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Content section */}
                <div className="w-full md:w-1/2 p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>
                    {amenities[selectedImage]?.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {amenities[selectedImage]?.description}
                  </p>
                  
                  <h3 className="font-semibold mb-3 text-lg">Featured Amenities:</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                    {amenities[selectedImage]?.features.map((feature, i) => {
                      const IconComponent = amenities[selectedImage]?.icons[i];
                      return (
                        <li key={i} className="flex items-center gap-2">
                          {IconComponent && <IconComponent style={{ color: themeColor }} />}
                          <span>{feature}</span>
                        </li>
                      );
                    })}
                  </ul>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      className="px-6 py-2 rounded-lg text-white"
                      style={{ backgroundColor: themeColor }}
                      onClick={closePopup}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FeatureCardProps {
  title: string
  index: number
  accentColor: string
  icon: React.ComponentType<any>
}

const FeatureCard = ({ title, index, accentColor, icon: Icon }: FeatureCardProps) => {
  return (
    <motion.div
      className="bg-black bg-opacity-20 rounded-lg p-3 flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.8 + (index * 0.1),
        type: "spring",
        stiffness: 100
      }}
      whileHover={{
        scale: 1.03,
        backgroundColor: `rgba(0,0,0,0.3)`,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}33` }}
        whileHover={{
          rotate: [0, -10, 10, -5, 0],
          transition: { duration: 0.5 }
        }}
      >
        <Icon size={20} color={accentColor} />
      </motion.div>
      <h3 className="font-bold">{title}</h3>
    </motion.div>
  )
}

export default SocialSection;
