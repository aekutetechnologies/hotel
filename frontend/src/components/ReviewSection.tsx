'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from 'lucide-react'
import Image from 'next/image'

interface Review {
  id: number
  userName: string
  date: string
  rating: number
  comment: string
  images?: string[]
}

interface ReviewSectionProps {
  reviews: Review[]
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  const totalReviews = 1135
  const averageRating = 4.4
  const ratingDistribution = {
    5: 67,
    4: 17,
    3: 9,
    2: 4,
    1: 3
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm border">
        <div>
          <Badge variant="outline" className="mb-4">
            ISO CERTIFIED
          </Badge>

          <div className="text-4xl font-bold mb-2">{averageRating}★</div>
          <div className="text-lg font-semibold mb-1">VERY GOOD</div>
          <div className="text-sm text-gray-500">{totalReviews} ratings</div>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-2">
              <span className="w-4">{rating}</span>
              <Star className="w-4 h-4 text-gray-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${ratingDistribution[rating as keyof typeof ratingDistribution]}%` }}
                />
              </div>
              <span className="w-8 text-sm text-gray-500">
                {ratingDistribution[rating as keyof typeof ratingDistribution]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <Image
                  src={`/placeholder.svg?text=${review.userName.charAt(0)}`}
                  alt={review.userName}
                  width={48}
                  height={48}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{review.userName}</span>
                  <Badge variant="outline" className="bg-green-50">
                    {review.rating}★
                  </Badge>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700 mb-4">{review.comment}</p>
                {review.images && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full">
        See all reviews
      </Button>
    </div>
  )
}

