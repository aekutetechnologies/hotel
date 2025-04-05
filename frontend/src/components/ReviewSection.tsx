'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Review {
  id: number
  user: {
    name: string
  }
  rating: number
  detail: string
  created_at: string
  images: string[]
}

interface ReviewSectionProps {
  reviews: Review[]
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Check if there are reviews first
  const hasReviews = Array.isArray(reviews) && reviews.length > 0
  
  // Calculate metrics only if we have reviews
  const averageRating = hasReviews 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0
  const totalReviews = hasReviews ? reviews.length : 0
  
  // Use a type-safe approach for rating distribution
  const ratingDistribution = hasReviews 
    ? reviews.reduce((acc, review) => {
        const rating = review.rating as 1 | 2 | 3 | 4 | 5;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>)
    : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;

  const getRatingDescription = (rating: number): string => {
    if (rating >= 4.5) return "Exceptional"
    if (rating >= 4.0) return "Outstanding"
    if (rating >= 3.5) return "Excellent"
    if (rating >= 3.0) return "Good"
    if (rating >= 2.5) return "Average"
    if (rating >= 2.0) return "Fair"
    return "Poor"
  }

  if (!hasReviews) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border text-center">
        <p className="text-gray-500 mb-2">No reviews yet</p>
        <p className="text-sm text-gray-400">Be the first to review this property!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6 p-6 bg-white rounded-lg shadow-sm border">
        <div>
          <div className="text-4xl font-bold mb-2">
            {typeof averageRating === 'number' ? averageRating.toFixed(1) : averageRating}★
          </div>
          <div className="text-lg font-semibold mb-1">{getRatingDescription(averageRating)}</div>
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
                  style={{
                    width: `${
                      totalReviews > 0
                        ? (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="w-8 text-sm text-gray-500">
                {totalReviews > 0
                  ? Math.round(
                      (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100
                    )
                  : 0}
                %
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.slice(0, 1).map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-medium text-lg">{review.user.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{review.user.name}</span>
                  <Badge variant="outline" className="bg-green-50">
                    {review.rating}★
                  </Badge>
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 mb-4">{review.detail}</p>
                {review.images && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <div key={`${review.id}-image-${index}`} className="relative w-20 h-20">
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

      <Dialog>
        <DialogTrigger asChild>
          {reviews.length > 1 && (
            <Button variant="neutral" className="w-full">
              See all reviews
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[60vw]">
          <DialogHeader>
            <DialogTitle>All Reviews</DialogTitle>
            <DialogDescription>
              Here are all the reviews for this property.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">{review.user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.user.name}</span>
                      <Badge variant="outline" className="bg-green-50">
                        {review.rating}★
                      </Badge>
                      <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{review.detail}</p>
                    {review.images && (
                      <div className="flex gap-2">
                        {review.images.map((image, index) => (
                          <div key={`${review.id}-image-${index}`} className="relative w-20 h-20">
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
        </DialogContent>
      </Dialog>
    </div>
  )
}

