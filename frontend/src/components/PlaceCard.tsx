"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
// import city1 from "/public/images/city/city1.jpg";
// import city2 from "/public/images/city/city2.jpg";
// import city3 from "/public/images/city/city3.jpg";
// import city4 from "/public/images/city/city4.jpg";

import hotel1 from "/public/hotel/hotel1.jpeg";
import hotel2 from "/public/hotel/hotel2.jpg";
import hotel3 from "/public/hotel/hotel3.jpg";
import hotel4 from "/public/hotel/hotel4.jpg";

import hostel1 from "/public/hostel/hostel1.jpg";
import hostel2 from "/public/hostel/hostel2.jpg";
import hostel3 from "/public/hostel/hostel3.jpg";
import hostel4 from "/public/hostel/hostel4.jpg";

interface placeCardProps {
  type: "hotel" | "hostel";
}

const PlaceCard = ({ type = "hotel" }: placeCardProps) => {
  const hotelData = [
    { 
      tilt: -10, 
      name: "HSquare Suites", 
      rating: 4.8,
      reviewCount: 124,
      img: hotel1 
    },
    { 
      tilt: 4, 
      name: "HSquare Business", 
      rating: 4.6,
      reviewCount: 98,
      img: hotel2 
    },
    { 
      tilt: -4, 
      name: "HSquare Urban", 
      rating: 4.5,
      reviewCount: 112,
      img: hotel3 
    },
    { 
      tilt: -12, 
      name: "HSquare Boutique", 
      rating: 4.4,
      reviewCount: 76,
      img: hotel4 
    },
  ];

  const hostelData = [
    { 
      tilt: -10, 
      name: "HSquare Social", 
      rating: 4.7,
      reviewCount: 87,
      img: hostel1 
    },
    { 
      tilt: 4, 
      name: "HSquare Co-Living", 
      rating: 4.6,
      reviewCount: 92,
      img: hostel2 
    },
    { 
      tilt: -4, 
      name: "HSquare Digital Nomad", 
      rating: 4.5,
      reviewCount: 112,
      img: hostel3 
    },
    { 
      tilt: -12, 
      name: "HSquare Budget Plus", 
      rating: 4.4,
      reviewCount: 76,
      img: hostel4 
    },
  ];

  const cardData = type === "hotel" ? hotelData : hostelData;
  const themeColor = type === "hotel" ? "#A31C44" : "#343F52";

  return (
    <div className="w-full min-h-screen flex flex-col justify-evenly items-center my-10 p-5 gap-10">
      {/* Heading Section */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8 lg:px-10 text-center">
        <h2 className={`text-2xl md:text-4xl font-bold mb-3 ${type === "hotel" ? "text-[#A31C44]" : "text-[#343F52]"}`}>
          {type === "hotel" 
            ? "Experience Luxury at HSquare Hotels" 
            : "Join the HSquare Community"}
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-2xl mx-auto">
          {type === "hotel"
            ? "Discover our handpicked collection of premium properties designed for the discerning traveler"
            : "More than just accommodation – find your tribe in our innovative social living spaces"}
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-6 md:px-8 lg:px-10">
        {cardData.map(({ tilt, name, rating, reviewCount, img }, index) => (
          <motion.div
            key={index}
            className={`w-full max-w-xs md:max-w-sm bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-xl font-bold cursor-pointer ${
              type === "hotel" 
                ? "text-[#A31C44] hover:bg-[#A31C44]" 
                : "text-[#343F52] hover:bg-[#343F52]"
            } hover:text-white`}
            initial={{ rotate: tilt, x: tilt * 2 }}
            whileHover={{ rotate: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Image Section */}
            <div className="w-full h-48">
              <Image src={img} alt={name} className="w-full h-full object-cover rounded-t-2xl" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-center items-center p-5 text-center">
              <h1 className="text-lg md:text-xl font-semibold">{name}</h1>
              
              {/* Rating and Review Count */}
              <div className="flex items-center mt-2 text-xs font-normal">
                <div className="flex items-center">
                  <Star size={12} className="fill-current" />
                  <span className="ml-1 font-medium">{rating}</span>
                </div>
                <span className="ml-2 opacity-75">({reviewCount} reviews)</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlaceCard;
