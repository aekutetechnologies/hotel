import { Button } from "@/components/ui/button"

const properties = [
  { id: 1, name: "Luxury Hotel", type: "Hotel", price: "₹2,000/night" },
  { id: 2, name: "Budget Hostel", type: "Hostel", price: "₹8,000/month" },
  { id: 3, name: "Business Hotel", type: "Hotel", price: "₹2,500/night" },
  { id: 4, name: "Student Hostel", type: "Hostel", price: "₹7,500/month" },
  { id: 5, name: "Boutique Hotel", type: "Hotel", price: "₹3,000/night" },
  { id: 6, name: "Long-stay Hostel", type: "Hostel", price: "₹9,000/month" },
  { id: 7, name: "Airport Hotel", type: "Hotel", price: "₹2,200/night" },
  { id: 8, name: "City Center Hostel", type: "Hostel", price: "₹8,500/month" },
  { id: 9, name: "Beach Resort", type: "Hotel", price: "₹3,500/night" },
  { id: 10, name: "Work-friendly Hostel", type: "Hostel", price: "₹9,500/month" },
  { id: 11, name: "Family Suite Hotel", type: "Hotel", price: "₹4,000/night" },
  { id: 12, name: "Backpackers Hostel", type: "Hostel", price: "₹7,000/month" },
]

export function FeaturedProperties() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#B11E43]">Our Properties in Mumbai</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={`/placeholder.svg?height=200&width=400&text=${property.name}`} alt={property.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                <p className="text-gray-600 mb-2">{property.type}</p>
                <p className="text-lg font-bold text-[#B11E43] mb-4">{property.price}</p>
                <Button className="w-full bg-[#B11E43] text-white hover:bg-[#8f1836]">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

