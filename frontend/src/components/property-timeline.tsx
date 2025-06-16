"use client"

import Image from "next/image"
import { Timeline } from "@/components/ui/timeline"

interface PropertyTimelineProps {
  type: "hotel" | "hostel"
}

export function PropertyTimeline({ type = "hotel" }: PropertyTimelineProps) {
  const hotelData = [
    {
      year: "Premium Accommodations",
      title: "",
      description: "At HSquare Hotels, we set new standards for luxury living. Our thoughtfully designed spaces feature premium furnishings, plush bedding, and ambient lighting to create the perfect retreat after a busy day.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Image
            src="/images/hotels/hotel_1.webp"
            alt="HSquare hotel exterior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_2.png"
            alt="HSquare hotel lobby"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Personalized Service",
      title: "",
      description: "We believe every guest deserves individual attention. Our dedicated staff provides round-the-clock service, from expedited check-in to custom room amenities. At HSquare Hotels, your preferences become our priorities.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Image
            src="/images/hotels/hotel_3.webp"
            alt="HSquare concierge service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_6.jpg"
            alt="HSquare room service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Luxury Room Experience",
      title: "",
      description: "Experience unparalleled comfort in our meticulously designed rooms. Each space features smart climate control, high-speed WiFi, and premium entertainment systems. Our signature HSquare beds with memory foam mattresses ensure a restful night's sleep, while the spacious en-suite bathrooms offer rain showers and luxury amenities.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Image
            src="/images/hotels/hotel_12.png"
            alt="HSquare luxury room"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_11.png"
            alt="HSquare bathroom amenities"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
  ]

  const hostelData = [
    {
      year: "Move-In Experience",
      title: "",
      description:
        "Starting your HSquare Hostel journey is effortless. We've taken care of the essentials—quality furniture, reliable appliances, and a fully-stocked kitchen. Simply bring your personal items and immediately feel at home in our community-focused environment.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="HSquare hostel exterior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="HSquare common area"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_3.jpg"
            alt="HSquare modern corridor"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg sm:col-span-2 md:col-span-1"
          />
        </div>
      ),
    },
    {
      year: "Private Spaces",
      title: "",
      description:
        "HSquare Hostels redefine shared living with thoughtfully designed private rooms. Each space features built-in storage solutions, comfortable workspaces, and quality bedding. Enjoy the perfect balance between community interaction and personal retreat.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Image
            src="/images/hostels/hostel_7.jpg"
            alt="HSquare private room"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_4.png"
            alt="HSquare room storage"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Hassle-Free Living",
      title: "",
      description:
        "At HSquare, we handle the daily chores so you can focus on what matters. Our professional staff takes care of cleaning, laundry, and maintenance while our digital platform lets you request services with a simple tap. We've reimagined hostel living for the modern resident.",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Image
            src="/images/hostels/hostel_5.png"
            alt="HSquare cleaning service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_6.jpg"
            alt="HSquare laundry service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-48 sm:h-52 md:h-60 w-full shadow-lg"
          />
        </div>
      ),
    }
  ]

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-8 lg:px-10">
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-4 text-center font-bold ${
            type === "hotel" ? "text-[#A31C44]" : "text-[#343F52]"
          }`}
        >
          {type === "hotel" 
            ? "The HSquare Hotel Experience" 
            : "Life at HSquare Hostels"}
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-base text-center max-w-2xl mx-auto">
          {type === "hotel"
            ? "Discover what makes our properties the preferred choice for discerning travelers"
            : "More than just a place to stay – it's a lifestyle designed for today's urban residents"}
        </p>
      </div>
      <div className="relative">
        <Timeline data={type === "hotel" ? hotelData : hostelData} theme={type} />
      </div>
    </div>
  )
}

