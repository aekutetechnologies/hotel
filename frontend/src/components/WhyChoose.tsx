import { Check } from "lucide-react"

export function WhyChoose() {
  const features = [
    {
      title: "Clean Rooms",
      description: "Experience pristine accommodations with our rigorous cleaning standards",
    },
    {
      title: "Premium Properties",
      description: "Carefully selected properties that meet our high-quality benchmarks",
    },
    {
      title: "Premium Locations",
      description: "Strategic locations offering convenience and accessibility",
    },
  ]

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Why Choose Hsquare?</h2>
              <p className="text-gray-600">Experience the difference with our premium hospitality services</p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img
              src="/images/whychooseus.png"
              alt="Premium Hotel Room"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

