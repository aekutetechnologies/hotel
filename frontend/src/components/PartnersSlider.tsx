'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

const partners = [
  {
    name: "Tailored Services",
    logo: "/placeholder.svg?height=60&width=200&text=Tailored+Services"
  },
  {
    name: "Tilak Maharashtra Vidyapeeth",
    logo: "/placeholder.svg?height=60&width=200&text=Tilak+Maharashtra+Vidyapeeth"
  },
  {
    name: "TATA Memorial Centre",
    logo: "/placeholder.svg?height=60&width=200&text=TATA+Memorial+Centre"
  },
  {
    name: "JECON Engineers",
    logo: "/placeholder.svg?height=60&width=200&text=JECON+Engineers"
  },
  // Add more partners as needed
]

export function PartnersSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.max(0, partners.length - 4))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.max(0, partners.length - 4))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + Math.max(0, partners.length - 4)) % Math.max(0, partners.length - 4))
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#B11E43]">Our Partners</h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
            >
              {partners.map((partner, index) => (
                <div key={partner.name} className="w-1/4 flex-shrink-0 px-4">
                  <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-32">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={200}
                      height={60}
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={prevSlide}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
          >
            <ChevronLeft size={24} className="text-[#B11E43]" />
          </Button>
          <Button
            onClick={nextSlide}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
          >
            <ChevronRight size={24} className="text-[#B11E43]" />
          </Button>
        </div>
      </div>
    </section>
  )
}

