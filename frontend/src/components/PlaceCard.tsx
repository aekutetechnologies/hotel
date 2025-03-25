"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
    { tilt: -10, name: "Luxury Stay", description: "A premium experience with top-tier amenities.", img: hotel1 },
    { tilt: 4, name: "Cozy Corner", description: "A budget-friendly stay with a homely vibe.", img: hotel2 },
    { tilt: -4, name: "Urban Retreat", description: "Modern accommodations in the heart of the city.", img: hotel3 },
    { tilt: -12, name: "Seaside Escape", description: "Enjoy the ocean breeze and relaxed atmosphere.", img: hotel4 },
  ];

  const hostelData = [
    { tilt: -10, name: "Backpackers Haven", description: "Affordable stay with shared spaces.", img: hostel1 },
    { tilt: 4, name: "Youth Spot", description: "A vibrant and social place for travelers.", img: hostel2 },
    { tilt: -4, name: "Nomad Hub", description: "Perfect for digital nomads and adventurers.", img: hostel3 },
    { tilt: -12, name: "Community Stay", description: "Experience communal living in a cozy environment.", img: hostel4 },
  ];

  const cardData = type === "hotel" ? hotelData : hostelData;

  return (
    <div className="w-full min-h-screen flex flex-col justify-evenly items-center my-10 p-5 gap-10">
      {/* Heading Section */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8 lg:px-10 text-center">
        <h2 className={`text-2xl md:text-4xl font-bold mb-3 ${type === "hotel" ? "text-[#A31C44]" : "text-[#2A2B2E]"}`}>
          Not just four walls and a roof
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-2xl mx-auto">
          Come over and experience how a place to stay can be so much more
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-6 md:px-8 lg:px-10">
        {cardData.map(({ tilt, name, description, img }, index) => (
          <motion.div
            key={index}
            className="w-full max-w-xs md:max-w-sm bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-xl font-bold  text-[#A31C44] cursor-pointer hover:bg-[#A31C44] hover:text-white"
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
              <h1 className="text-lg md:text-xl font-semibold ">{name}</h1>
              <p className="text-white text-sm md:text-base mt-2 px-2 rounded-lg bg-black">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlaceCard;
