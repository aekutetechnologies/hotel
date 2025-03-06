import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment: "Exceptional stay! The room was immaculate and the location was perfect. Will definitely be coming back.",
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    comment: "Outstanding service and beautiful property. The attention to detail really made our stay special.",
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Emma Williams",
    rating: 5,
    comment: "Loved the premium amenities and the professional staff. A truly luxurious experience.",
    avatar: "/placeholder.svg",
  },
]

export function Reviews(property_type: string) {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">Stories from Our Guests</h2>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-lg border">
              <div className="flex items-center gap-4 mb-4">
                <img src={review.avatar || "/placeholder.svg"} alt={review.name} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-medium">{review.name}</div>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{review.comment}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            View More Reviews
          </Button>
        </div>
      </div>
    </div>
  )
}

