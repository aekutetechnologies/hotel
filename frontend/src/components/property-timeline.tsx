"use client"

import Image from "next/image"
import { Timeline } from "@/components/ui/timeline"

interface PropertyTimelineProps {
  type: "hotel" | "hostel"
}

export function PropertyTimeline({ type = "hotel" }: PropertyTimelineProps) {
  const hotelData = [
    {
      year: "Luxury Living",
      title: "Not just four walls and a roof",
      description: "Experience unparalleled comfort and elegance in our thoughtfully designed spaces.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hotels/hotel_1.webp"
            alt="Luxury hotel exterior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_2.png"
            alt="Hotel lobby"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Premium Rooms",
      title: "Space for luxury and comfort",
      description: "Each room is a sanctuary of peace and luxury, designed for the discerning traveler.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hotels/hotel_3.webp"
            alt="Luxury bedroom"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_1.webp"
            alt="Hotel bathroom"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Fine Dining",
      title: "Culinary excellence",
      description: "Experience gourmet dining with our world-class chefs and premium ingredients.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hotels/hotel_2.png"
            alt="Restaurant interior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hotels/hotel_3.webp"
            alt="Gourmet dish"
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
      year: "Day One",
      title: "Start living your best life from day one",
      description:
        "Bring a box full of hopes, dreams, ambitions... and of course, your personal belongings. Everything else - furniture, appliances, food - has already been taken care of.",
      content: (
        <div className="grid grid-cols-3 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="Building exterior"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="Common area with yellow chairs"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_3.jpg"
            alt="Modern corridor"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Your Space",
      title: "Step into a room that has room for everything",
      description:
        "Your clothes and bag will not be fighting for space on the same chair. At Stanza Living, there's ample room for all your possessions. Even a framed photo of your family, for the rare occasions you miss home.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="Spacious bedroom"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="Room storage"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Services",
      title: "Take your daily list of chores. And tear it up",
      description:
        "You have better things to do than wash your clothes, clean up your room and cook your meals. So our team of pros will do them all for you.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="Cleaning service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="Laundry service"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Common Areas",
      title: "Chill in a common area that's anything but common",
      description:
        "Nope, we don't try to pass off a few plastic chairs and a TV as a common area. We've replaced them with sofas, bean bags and large-screen TVs. And we've also added gaming zones, fitness centres and chillout corners as a bonus.",
      content: (
        <div className="grid grid-cols-3 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="Modern common area"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="Gaming zone"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_3.jpg"
            alt="Fitness center"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
        </div>
      ),
    },
    {
      year: "Dining",
      title: 'Don\'t come expecting "hostel-PG food"',
      description:
        "Instead, bring along a big appetite for healthy, yummy meals. With freshly-made food that have a local touch. And that, at the same time, take your taste buds on a journey back home.",
      content: (
        <div className="grid grid-cols-3 gap-4">
          <Image
            src="/images/hostels/hostel_1.jpg"
            alt="Healthy meal"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_2.jpg"
            alt="Fresh sandwiches"
            width={500}
            height={500}
            className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg"
          />
          <Image
            src="/images/hostels/hostel_3.jpg"
            alt="Local cuisine"
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
          className={`text-lg md:text-4xl mb-4 text-center font-bold font-rock-salt ${
            type === "hotel" ? "text-[#A31C44]" : "text-[#2A2B2E]"
          }`}
        >
          Not just four walls and a roof
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base text-center max-w-2xl mx-auto">
          Come over and experience how a place to stay can be so much more
        </p>
      </div>
      <div className="relative">
        <Timeline data={type === "hotel" ? hotelData : hostelData} theme={type} />
      </div>
    </div>
  )
}

