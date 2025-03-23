"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import city1 from "/public/images/city/city1.jpg";
import city2 from "/public/images/city/city2.jpg";
import city3 from "/public/images/city/city3.jpg";
import city4 from "/public/images/city/city4.jpg";

interface PropertyTimelineProps {
  type: "hotel" | "hostel";
}

const PlaceCard = ({ type = "hotel" }: PropertyTimelineProps) => {
  const testCardData = [
    { tilt: -10, city: "New York", description: "The city that never sleeps.", img: city1 },
    { tilt: 4, city: "Paris", description: "The city of lights.", img: city2 },
    { tilt: -4, city: "Tokyo", description: "The heart of Japan.", img: city3 },
    { tilt: -12, city: "Sydney", description: "The harbour city.", img: city4 },
  ];

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
        {testCardData.map(({ tilt, city, description, img }, index) => (
          <motion.div
            key={index}
            className="w-full max-w-xs md:max-w-sm bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-xl font-bold cursor-pointer hover:shadow-[#A31C44]"
            initial={{ rotate: tilt, x: tilt * 2 }}
            whileHover={{ rotate: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Image Section */}
            <div className="w-full h-48">
              <Image src={img} alt={city} className="w-full h-full object-cover rounded-t-2xl" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-center items-center p-5 text-center">
              <h1 className="text-lg md:text-xl font-semibold text-[#A31C44]">{city}</h1>
              <p className="text-gray-600 text-sm md:text-base mt-2">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlaceCard;
