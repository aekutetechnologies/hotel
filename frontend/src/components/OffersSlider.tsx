'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const offers = [
  { id: 1, title: "Summer Special", description: "Get 20% off on all hotel bookings", image: "/placeholder.svg?height=200&width=600&text=Summer+Special" },
  { id: 2, title: "Long Stay Discount", description: "Book for 7 nights, pay for 6", image: "/placeholder.svg?height=200&width=600&text=Long+Stay+Discount" },
  { id: 3, title: "Early Bird Offer", description: "10% off when you book 30 days in advance", image: "/placeholder.svg?height=200&width=600&text=Early+Bird+Offer" },
  { id: 4, title: "Group Booking Deal", description: "15% off for group bookings of 5 or more", image: "/placeholder.svg?height=200&width=600&text=Group+Booking+Deal" },
]

export function OffersSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#B11E43]">Special Offers</h2>
        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {offers.map((offer) => (
                <div key={offer.id} className="w-full flex-shrink-0">
                  <div className="relative h-64">
                    <Image src={offer.image} alt={offer.title} layout="fill" objectFit="cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-8">
                      <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                      <p className="text-lg text-center">{offer.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300">
            <ChevronLeft size={24} className="text-[#B11E43]" />
          </button>
          <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300">
            <ChevronRight size={24} className="text-[#B11E43]" />
          </button>
        </div>
      </div>
    </section>
  )
}

