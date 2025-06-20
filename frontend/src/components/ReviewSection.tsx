'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Review {
  id: number
  user: {
    name: string
  }
  rating: number
  review: string
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
      <div className="p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-gray-500 mb-2">No reviews yet</p>
        <p className="text-sm text-gray-400">Be the first to review this property!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6 p-6 bg-white rounded-xl shadow-lg">
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
              <div className="min-w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-medium text-lg">{review.user.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-medium">{review.user.name}</span>
                  <Badge variant="outline" className="bg-green-50">
                    {review.rating}★
                  </Badge>
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 mb-4">{review.review}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {review.images.map((image, index) => (
                      <div key={`${review.id}-image-${index}`} className="relative w-24 h-24 overflow-hidden rounded-xl shadow-lg">
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover"
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
        <DialogContent 
          className="sm:max-w-[60vw]" 
          style={{ 
            zIndex: 50,
            maxHeight: '85vh'  // Limit height to 85% of viewport height
          }}
        >
          <DialogHeader className="relative">
            <DialogTitle>All Reviews ({reviews.length})</DialogTitle>
            <DialogDescription>
              Average rating: {averageRating.toFixed(1)}★ • {getRatingDescription(averageRating)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-120px)] pr-2 pb-2">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="min-w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">{review.user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-medium">{review.user.name}</span>
                        <Badge variant="outline" className="bg-green-50">
                          {review.rating}★
                        </Badge>
                        <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 mb-4">{review.review}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {review.images.map((image, index) => (
                            <div key={`${review.id}-image-${index}`} className="relative w-24 h-24 overflow-hidden rounded-xl shadow-lg">
                              <Image
                                src={image}
                                alt={`Review image ${index + 1}`}
                                fill
                                className="object-cover"
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
            
            {/* Scroll indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t from-white to-transparent flex justify-center items-end pb-2">
              <ChevronDown className="h-5 w-5 text-gray-400 animate-bounce" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

