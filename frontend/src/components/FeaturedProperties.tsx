"use client"

import { DynamicFrameLayout } from "./dynamic-frame-layout"

interface PropertyContent {
  city: string
  name: string
  price: number
  rating: number
  reviews: number
  beds?: number
}

const PropertyCard = ({ property }: { property: PropertyContent }) => {
  return (
    <div className="flex flex-col h-full justify-end">
      <p className="font-bold md:text-4xl text-2xl text-white mb-2">{property.city}</p>
      <div className="bg-black/50 text-white text-sm px-3 py-1.5 rounded-sm mt-1 inline-block mb-3">
        {property.name}
      </div>
      <div className="flex justify-between items-center mt-auto">
        <span className="font-bold text-white text-xl">
          ${property.price}
          <span className="text-base text-white/80">/night</span>
        </span>
        <div className="flex items-center">
          <span className="text-yellow-400 mr-1 text-lg">★</span>
          <span className="text-base text-white/80">
            {property.rating} ({property.reviews})
          </span>
        </div>
      </div>
      {property.beds && (
        <div className="text-base text-white/80 mt-2 bg-black/50 px-3 py-1.5 rounded-sm inline-block">
          {property.beds} bed dorm
        </div>
      )}
    </div>
  )
}

export function FeaturedProperties({ type = "hostels" }: { type?: "hotels" | "hostels" }) {
  const properties = [
    {
      id: 1,
      city: "Vienna",
      name: "Wombat's City Hostel Vienna",
      image:
        "/images/hostels/hostel_1.jpg",
      price: 29,
      rating: 4.8,
      reviews: 1250,
      beds: 6,
      defaultPos: { x: 0, y: 0, w: 4, h: 4 },
    },
    {
      id: 2,
      city: "Munich",
      name: "Wombat's Hauptbahnhof",
      image:
        "/images/hostels/hostel_2.jpg",
      price: 32,
      rating: 4.9,
      reviews: 980,
      beds: 4,
      defaultPos: { x: 4, y: 0, w: 4, h: 4 },
    },
    {
      id: 3,
      city: "London",
      name: "Wombat's City Hostel London",
      image:
        "/images/hostels/hostel_3.jpg",
      price: 35,
      rating: 4.7,
      reviews: 1500,
      beds: 8,
      defaultPos: { x: 8, y: 0, w: 4, h: 4 },
    },
    {
      id: 4,
      city: "Budapest",
      name: "Wombat's City Hostel Budapest",
      image:
        "/images/hostels/hostel_1.jpg",
      price: 25,
      rating: 4.6,
      reviews: 890,
      beds: 6,
      defaultPos: { x: 0, y: 4, w: 4, h: 4 },
    },
    {
      id: 5,
      city: "Leipzig",
      name: "Wombat's City Hostel Leipzig",
      image:
        "/images/hostels/hostel_2.jpg",
      price: 28,
      rating: 4.7,
      reviews: 760,
      beds: 6,
      defaultPos: { x: 4, y: 4, w: 4, h: 4 },
    },
    {
      id: 6,
      city: "Berlin",
      name: "Wombat's City Hostel Berlin",
      image:
        "/images/hostels/hostel_3.jpg",
      price: 30,
      rating: 4.8,
      reviews: 1100,
      beds: 8,
      defaultPos: { x: 8, y: 4, w: 4, h: 4 },
    },
    {
      id: 7,
      city: "Amsterdam",
      name: "Wombat's City Hostel Amsterdam",
      image:
        "/images/hostels/hostel_1.jpg",
      price: 34,
      rating: 4.6,
      reviews: 950,
      beds: 6,
      defaultPos: { x: 0, y: 8, w: 4, h: 4 },
    },
    {
      id: 8,
      city: "Prague",
      name: "Wombat's City Hostel Prague",
      image:
        "/images/hostels/hostel_2.jpg",
      price: 26,
      rating: 4.7,
      reviews: 870,
      beds: 10,
      defaultPos: { x: 4, y: 8, w: 4, h: 4 },
    },
    {
      id: 9,
      city: "Barcelona",
      name: "Wombat's City Hostel Barcelona",
      image:
        "/images/hostels/hostel_3.jpg",
      price: 32,
      rating: 4.9,
      reviews: 1300,
      beds: 8,
      defaultPos: { x: 8, y: 8, w: 4, h: 4 },
    },
  ]

  const hotelProperties = [
    {
      id: 1,
      city: "Paris",
      name: "Grand Hotel Paris",
      image:
        "/images/hotels/hotel_1.webp",
      price: 199,
      rating: 4.9,
      reviews: 2250,
      defaultPos: { x: 0, y: 0, w: 4, h: 4 },
    },
    {
      id: 2,
      city: "New York",
      name: "Manhattan Luxury Hotel",
      image:
        "/images/hotels/hotel_2.png",
      price: 299,
      rating: 4.8,
      reviews: 1980,
      defaultPos: { x: 4, y: 0, w: 4, h: 4 },
    },
    {
      id: 3,
      city: "Tokyo",
      name: "Shibuya Skyline Hotel",
      image:
        "/images/hotels/hotel_3.webp",
      price: 250,
      rating: 4.7,
      reviews: 1500,
      defaultPos: { x: 8, y: 0, w: 4, h: 4 },
    },
    {
      id: 4,
      city: "Dubai",
      name: "Palm Luxury Resort",
      image:
        "/images/hotels/hotel_1.webp",
      price: 350,
      rating: 4.9,
      reviews: 890,
      defaultPos: { x: 0, y: 4, w: 4, h: 4 },
    },
    {
      id: 5,
      city: "Rome",
      name: "Colosseum View Hotel",
      image:
        "/images/hotels/hotel_2.png",
      price: 180,
      rating: 4.6,
      reviews: 760,
      defaultPos: { x: 4, y: 4, w: 4, h: 4 },
    },
    {
      id: 6,
      city: "London",
      name: "Westminster Palace Hotel",
      image:
        "/images/hotels/hotel_3.webp",
      price: 275,
      rating: 4.8,
      reviews: 1200,
      defaultPos: { x: 8, y: 4, w: 4, h: 4 },
    },
    {
      id: 7,
      city: "Sydney",
      name: "Opera House View Hotel",
      image:
        "/images/hotels/hotel_1.webp",
      price: 220,
      rating: 4.7,
      reviews: 950,
      defaultPos: { x: 0, y: 8, w: 4, h: 4 },
    },
    {
      id: 8,
      city: "Barcelona",
      name: "Sagrada Familia Hotel",
      image:
        "/images/hotels/hotel_1.webp",
      price: 190,
      rating: 4.8,
      reviews: 1100,
      defaultPos: { x: 4, y: 8, w: 4, h: 4 },
    },
    {
      id: 9,
      city: "Singapore",
      name: "Marina Bay Hotel",
      image:
        "/images/hotels/hotel_2.png",
      price: 310,
      rating: 4.9,
      reviews: 1800,
      defaultPos: { x: 8, y: 8, w: 4, h: 4 },
    },
  ]

  const selectedProperties = type === "hotels" ? hotelProperties : properties

  const frames = selectedProperties.map((property) => ({
    id: property.id,
    image: property.image,
    content: <PropertyCard property={property} />,
    defaultPos: property.defaultPos,
    mediaSize: 1,
  }))

  return (
    <div className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <h3 className="text-4xl font-bold mb-12 text-center font-rock-salt">
          {type === "hotels" ? "Featured Hotels" : "Popular Hostels"}
        </h3>

        <div className="h-[800px]">
          <DynamicFrameLayout frames={frames} className="w-full h-full" hoverSize={6} gapSize={8} />
        </div>
      </div>
    </div>
  )
}

