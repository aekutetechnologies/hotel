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
          {/* Subscribe Button */}
          {/* <button
            className={`px-6 py-3 ] text-white font-bold rounded-lg hover:bg-y[#A31C44] transition ${
              type === "hotel" ? "bg-[#2A2B2E]" : "bg-[#A31C44]"
            }`}
          >
            Subscribe
          </button> */}

          {/* Social Media Icons */}
          {/* <div className="flex gap-4 text-3xl">
            <FaInstagram
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:text-[#A31C44] "
              }`}
            />
            <FaTiktok
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:[#A31C44] "
              }`}
            />
            <FaYoutube
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:[#A31C44] "
              }`}
            />
            <FaFacebook
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:text-[#A31C44] "
              }`}
            />
            <FaLinkedin
              className={` transition cursor-pointer ${
                type == "hotel" ? "hover:text-black" : "hover:text-[#A31C44] "
              }`}
            />
          </div> */}

          {type === "hostel" ? (
            <Image
              src={hosteldayss}
              alt="hostel image"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={hoteldayss}
              alt="hostel image"
              className="w-full h-full object-cover"
            />
          )}

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

export default SocialSection;
