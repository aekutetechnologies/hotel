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
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hotels/hotel_1.webp"
            alt="HSquare hotel exterior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_2.png"
            alt="HSquare hotel lobby"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Personalized Service",
      title: "",
      description: "We believe every guest deserves individual attention. Our dedicated staff provides round-the-clock service, from expedited check-in to custom room amenities. At HSquare Hotels, your preferences become our priorities.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hotels/hotel_3.webp"
            alt="HSquare concierge service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_1.webp"
            alt="HSquare room service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Culinary Excellence",
      title: "",
      description: "HSquare's signature restaurants fuse local ingredients with global techniques. Our executive chefs craft seasonal menus that celebrate authentic flavors while offering modern interpretations of classic dishes. Dining with us is a journey for your palate.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hotels/hotel_2.png"
            alt="HSquare restaurant interior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_3.webp"
            alt="HSquare signature dish"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
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
        <div className="grid grid-cols-3 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="HSquare hostel exterior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="HSquare common area"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_3.jpg"
            alt="HSquare modern corridor"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
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
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="HSquare private room"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="HSquare room storage"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
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
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="HSquare cleaning service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="HSquare laundry service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Community Spaces",
      title: "",
      description:
        "HSquare's signature communal areas foster genuine connections. Our designer spaces include high-tech entertainment zones, fully-equipped fitness centers, collaborative workspaces, and relaxing lounges—all thoughtfully designed to bring people together while respecting the need for different activity zones.",
      content: (
        <div className="grid grid-cols-3 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="HSquare common lounge"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="HSquare gaming zone"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_3.jpg"
            alt="HSquare fitness center"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Curated Dining",
      title: "",
      description:
        "HSquare's culinary program blends nutrition with community. Our dining halls serve diverse menus with healthy, flavorful options that cater to all dietary preferences. Regular community meals and food events create opportunities to share stories and cultures over delicious food.",
      content: (
        <div className="grid grid-cols-3 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="HSquare dining hall"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="HSquare healthy meals"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_3.jpg"
            alt="HSquare community dinner"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-10">
        <h2
          className={`text-lg md:text-4xl mb-4 text-center font-bold ${
            type === "hotel" ? "text-[#A31C44]" : "text-[#343F52]"
          }`}
        >
          {type === "hotel" 
            ? "The HSquare Hotel Experience" 
            : "Life at HSquare Hostels"}
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base text-center max-w-2xl mx-auto">
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

