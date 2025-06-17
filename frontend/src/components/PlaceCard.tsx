"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { getAllProperties } from "@/lib/api/getAllProperties";
import { type Property } from "@/types/property";

interface placeCardProps {
  type: "hotel" | "hostel";
}

const PlaceCard = ({ type = "hotel" }: placeCardProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [hotelProperties, setHotelProperties] = useState<Property[]>([]);
  const [hostelProperties, setHostelProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getAllProperties();
        setProperties(data);
        const hotels = data.filter(property => property.property_type === "hotel").slice(0, 4);
        const hostels = data.filter(property => property.property_type === "hostel").slice(0, 4);
        setHotelProperties(hotels);
        setHostelProperties(hostels);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const themeColor = type === "hotel" ? "#A31C44" : "#343F52";

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A31C44]"></div>
      </div>
    );
  }

  // Get current properties based on type
  const currentProperties = type === "hotel" ? hotelProperties : hostelProperties;
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-7xl mx-auto">
        {/* Heading Section */}
        <div className="text-center mb-10">
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
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {currentProperties.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No {type} properties found</p>
              </div>
            ) : (
              currentProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  className={`w-full max-w-xs bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center text-xl font-bold cursor-pointer ${
                    type === "hotel" 
                      ? "text-[#A31C44] hover:bg-[#A31C44]" 
                      : "text-[#343F52] hover:bg-[#343F52]"
                  } hover:text-white`}
                  initial={{ rotate: index % 2 === 0 ? -10 : 10, x: index % 2 === 0 ? -20 : 20 }}
                  whileHover={{ rotate: 0, x: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  {/* Image Section */}
                  <div className="w-full h-48">
                    <Image 
                      src={property.images?.[0]?.image || "/images/placeholder.jpg"} 
                      alt={property.name} 
                      className="w-full h-full object-cover rounded-t-2xl"
                      width={500}
                      height={300}
                    />
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col justify-center items-center p-5 text-center">
                    <h1 className="text-lg md:text-xl font-semibold">{property.name}</h1>
                    
                    {/* Location */}
                    <p className="text-sm text-gray-600 mt-1">
                      {property.city?.name}, {property.state?.name}
                    </p>

                    {/* Rating and Review Count */}
                    <div className="flex items-center mt-2 text-xs font-normal">
                      <div className="flex items-center">
                        <Star size={12} className="fill-current" />
                        <span className="ml-1 font-medium">
                          {property.reviews && property.reviews.length > 0 
                            ? (property.reviews.reduce((acc, review) => acc + review.rating, 0) / property.reviews.length).toFixed(1)
                            : "New"}
                        </span>
                      </div>
                      <span className="ml-2 opacity-75">
                        ({property.reviews?.length || 0} reviews)
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
