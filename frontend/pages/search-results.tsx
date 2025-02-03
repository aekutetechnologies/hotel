'use client'

import { useState } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Link from 'next/link'
import { Star, Wifi, Battery, MapPin } from 'lucide-react'

const hotels = [
  {
    id: 1,
    name: "Super Hotel O Four Bungalow formerly Ardaas Residency",
    location: "Near Janki Devi Public School, Andheri West, Mumbai",
    rating: 4.7,
    reviews: 214,
    amenities: ["Reception", "Free Wifi", "Power backup"],
    price: 3142,
    originalPrice: 11371,
    discount: 72,
    image: "/placeholder.svg?height=200&width=300&text=Hotel+Image"
  },
  // Add more hotel objects here...
]

export default function SearchResults() {
  const [priceRange, setPriceRange] = useState([0, 5000])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Price Range</h3>
                <Slider
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
                <div className="flex justify-between mt-2">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Popular locations</h3>
                <Input type="text" placeholder="Search..." className="mb-2" />
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Andheri East
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Thane
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Dadar
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Bandra
                  </label>
                </div>
              </div>
              {/* Add more filter options here */}
            </div>
          </div>

          {/* Hotel Listings */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">148 OYOs in Mumbai, Maharashtra, India</h1>
              <Select>
                <option>Popularity</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
              </Select>
            </div>
            <div className="space-y-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
                    </div>
                    <div className="w-full md:w-2/3 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">{hotel.name}</h2>
                          <p className="text-gray-600 mb-2">{hotel.location}</p>
                          <div className="flex items-center mb-2">
                            <div className="bg-green-500 text-white px-2 py-1 rounded flex items-center mr-2">
                              <Star size={16} className="mr-1" />
                              <span>{hotel.rating}</span>
                            </div>
                            <span className="text-gray-600">({hotel.reviews} Ratings) • Excellent</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            {hotel.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center text-gray-600">
                                {amenity === "Reception" && <MapPin size={16} className="mr-1" />}
                                {amenity === "Free Wifi" && <Wifi size={16} className="mr-1" />}
                                {amenity === "Power backup" && <Battery size={16} className="mr-1" />}
                                <span>{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#B11E43] mb-1">₹{hotel.price}</div>
                          <div className="text-gray-500 line-through mb-1">₹{hotel.originalPrice}</div>
                          <div className="text-green-500 font-semibold mb-2">{hotel.discount}% off</div>
                          <Link href={`/hotel/${hotel.id}`}>
                            <Button className="bg-[#B11E43] hover:bg-[#8f1836] text-white">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

