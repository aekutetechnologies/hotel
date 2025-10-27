"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllProperties } from "@/lib/api/getAllProperties";
import { type Property } from "@/types/property";
import { Building, MapPin, Users, Star } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface placeCardProps {
  type: "hotel" | "hostel";
}

const PlaceCard = ({ type = "hotel" }: placeCardProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [hotelProperties, setHotelProperties] = useState<Property[]>([]);
  const [hostelProperties, setHostelProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);

  const Counter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayValue = useTransform(rounded, (latest) => {
      if (latest >= 1000) {
        return `${(latest / 1000).toFixed(0)}K+`;
      }
      return `${latest}+`;
    });

    useEffect(() => {
      const animation = animate(count, value, { duration });
      return animation.stop;
    }, [count, value, duration]);

    return <motion.span>{displayValue}</motion.span>;
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getAllProperties();
        setProperties(data);
        const hotels = data.filter((p) => p.property_type === "hotel").slice(0, 4);
        const hostels = data.filter((p) => p.property_type === "hostel").slice(0, 4);
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

  const themeColor = type === "hotel" ? "#A31C44" : "#A31C44";

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A31C44]"></div>
      </div>
    );
  }

  const currentProperties = type === "hotel" ? hotelProperties : hostelProperties;

  return (
    <>
      <div className="w-full min-h-screen flex justify-center p-5">
        <div className="w-full max-w-7xl mx-auto flex flex-col space-y-10">
          {/* Heading Section */}
          <div className="text-center">
            <h2 className={`text-2xl md:text-4xl font-bold ${type === "hotel" ? "text-[#A31C44]" : "text-[#A31C44]"}`}>
              {type === "hotel" ? "Experience Luxury at HSquare Hotels" : "Join the HSquare Community"}
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-2xl mx-auto">
              {type === "hotel"
                ? "Discover our handpicked collection of premium properties designed for the discerning traveler"
                : "More than just accommodation – find your tribe in our innovative social living spaces"}
            </p>
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center">
            {currentProperties.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No {type} properties found</p>
              </div>
            ) : (
              currentProperties.map((property) => {
                // Generate dates based on property type
                const today = new Date();
                const checkInDate = new Date(today);
                let checkOutDate = new Date(today);
                
                if (type === "hotel") {
                  // For hotels: check-out after 1 day
                  checkOutDate.setDate(checkOutDate.getDate() + 1);
                } else {
                  // For hostels: check-out after 1 month
                  checkOutDate.setMonth(checkOutDate.getMonth() + 1);
                }
                
                // Format dates as YYYY-MM-DD
                const formatDate = (date: Date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                };
                
                const propertyUrl = `/property/${property.id}?location=${property.location || 'Mumbai'}&propertyType=${property.property_type}&bookingType=${type === 'hotel' ? 'daily' : 'monthly'}&checkInDate=${formatDate(checkInDate)}&checkOutDate=${formatDate(checkOutDate)}&rooms=1&guests=1`;
                
                return (
                  <div key={property.id} className="flex flex-col items-start">
                    <Link href={propertyUrl} className="group block">
                      {/* Full Image Card */}
                      <div className="relative w-full max-w-[280px] h-[380px] rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl">
                        <Image
                          src={property.images?.[0]?.image || "/images/placeholder.jpg"}
                          alt={property.name}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#A31C44] text-white font-semibold text-sm px-3 py-1 rounded">
                          {property.property_type || "Zen zone"}
                        </div>
                      </div>
                    </Link>

                  {/* Text Info Below Image */}
                  <div className="mt-4 px-1">
                    <h3 className="text-base font-semibold text-[#A31C44]">
                      {property.name}, {property.location || "India"}
                    </h3>
                  </div>
                </div>
              );
              })
            )}
          </div>

          {/* Statistics Section */}
          <div className="bg-white py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <MapPin className="h-8 w-8 text-red-600" />,
                  label: "Areas Covered in Mumbai",
                  value: 10,
                },
                {
                  icon: <Building className="h-8 w-8 text-red-600" />,
                  label: `${type === "hotel" ? "Hotels" : "Hostels"} Available`,
                  value: 12,
                },
                {
                  icon: <Users className="h-8 w-8 text-red-600" />,
                  label: "Happy Customers",
                  value: 1000,
                },
                {
                  icon: <Star className="h-8 w-8 text-red-600" />,
                  label: "Average Rating",
                  value: 4.9,
                  isStatic: true,
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                  className="bg-gray-50 rounded-lg p-6 text-center"
                  onViewportEnter={() => setIsInView(true)}
                >
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full p-3 bg-red-50">{stat.icon}</div>
                  </div>
                  <h3 className="text-4xl font-bold mb-2">
                    {stat.isStatic ? stat.value : <Counter value={stat.value} />}
                  </h3>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaceCard;
