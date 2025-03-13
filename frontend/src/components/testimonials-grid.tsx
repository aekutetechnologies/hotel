"use client"

import { Card } from "@/components/ui/card"
import { PlayCircle, Star } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

interface Testimonial {
  id: number
  name: string
  image: string
  rating: number
  text: string
  hasVideo?: boolean
  highlight?: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Jack F.",
    image: "/placeholder.svg?height=50&width=50",
    rating: 5,
    text: "I shipped in 6 days as a noob coder... This is awesome",
    hasVideo: true,
    highlight: "This is awesome",
  },
  {
    id: 2,
    name: "Tim Finley",
    image: "/placeholder.svg?height=50&width=50",
    rating: 5,
    text: "Just got my first customer, I've 4x my investment",
    highlight: "4x my investment",
  },
  {
    id: 3,
    name: "Alex Martinez",
    image: "/placeholder.svg?height=50&width=50",
    rating: 5,
    text: "Everything you need to ship your SaaS ASAP",
    hasVideo: true,
    highlight: "ship your SaaS ASAP",
  },
  {
    id: 4,
    name: "Mateusz Siatrak",
    image: "/placeholder.svg?height=50&width=50",
    rating: 5,
    text: "Yesterday I've made a first sale! 🎉",
    hasVideo: true,
    highlight: "first sale",
  },
  {
    id: 5,
    name: "Larry",
    image: "/placeholder.svg?height=50&width=50",
    rating: 5,
    text: "I've already made back the money I spent",
    hasVideo: true,
    highlight: "made back the money",
  },
]

export function TestimonialsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
      {testimonials.map((testimonial) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: testimonial.id * 0.1 }}
        >
          <Card className="overflow-hidden bg-[#1a1a1a] text-white relative">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                {testimonial.hasVideo && (
                  <div className="absolute -left-2 -top-2">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                )}
                <p className="text-sm leading-relaxed">&quot;{testimonial.text}&quot;</p>
                {testimonial.highlight && (
                  <div className="mt-2 inline-block bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-sm">
                    {testimonial.highlight}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

