'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const properties = [
  { id: 1, name: "Luxury Suite", type: "Hotel", image: "/placeholder.svg?height=300&width=400&text=Luxury+Suite" },
  { id: 2, name: "Cozy Hostel", type: "Hostel", image: "/placeholder.svg?height=300&width=400&text=Cozy+Hostel" },
  { id: 3, name: "Business Hotel", type: "Hotel", image: "/placeholder.svg?height=300&width=400&text=Business+Hotel" },
  { id: 4, name: "Budget Hostel", type: "Hostel", image: "/placeholder.svg?height=300&width=400&text=Budget+Hostel" },
  { id: 5, name: "Boutique Hotel", type: "Hotel", image: "/placeholder.svg?height=300&width=400&text=Boutique+Hotel" },
  { id: 6, name: "Student Hostel", type: "Hostel", image: "/placeholder.svg?height=300&width=400&text=Student+Hostel" },
]

export function PropertySlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % properties.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % properties.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + properties.length) % properties.length)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#B11E43]">Our Properties in Mumbai</h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}>
              {properties.map((property, index) => (
                <div key={property.id} className="w-1/3 flex-shrink-0 px-2">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <Image src={property.image} alt={property.name} width={400} height={300} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
                      <p className="text-gray-600">{property.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={prevSlide} className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300">
            <ChevronLeft size={24} className="text-[#B11E43]" />
          </button>
          <button onClick={nextSlide} className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300">
            <ChevronRight size={24} className="text-[#B11E43]" />
          </button>
        </div>
      </div>
    </section>
  )
}

