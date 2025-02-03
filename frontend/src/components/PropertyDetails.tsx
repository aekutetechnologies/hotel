import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Property, Hotel, Hostel, HotelRoom, HostelRoom } from '@/types/property'

interface PropertyDetailsProps {
  property: Property
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const renderRoomInfo = (room: HotelRoom | HostelRoom) => {
    if ('name' in room) {
      // This is a HotelRoom
      return (
        <div>
          <h3 className="text-lg font-semibold">{room.name}</h3>
          <p className="text-sm text-gray-600">{room.description}</p>
          <p className="text-sm text-gray-600">Size: {room.size}</p>
          <p className="text-sm text-gray-600">Max Occupancy: {room.maxOccupancy}</p>
          <p className="text-sm font-semibold">Price: ₹{room.basePrice}/night</p>
        </div>
      )
    } else {
      // This is a HostelRoom
      return (
        <div>
          <h3 className="text-lg font-semibold">{room.occupancyType}</h3>
          <p className="text-sm text-gray-600">{room.description}</p>
          <p className="text-sm text-gray-600">Available Beds: {room.availableBeds} / {room.totalBeds}</p>
          <p className="text-sm font-semibold">Price: ₹{room.basePrice}/month</p>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="font-medium">Name</dt>
              <dd>{property.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Type</dt>
              <dd>{property.type}</dd>
            </div>
            <div>
              <dt className="font-medium">Location</dt>
              <dd>{property.location}</dd>
            </div>
            <div>
              <dt className="font-medium">Status</dt>
              <dd>
                <Badge variant={property.status === 'Active' ? 'success' : 'secondary'}>
                  {property.status}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
  <CardHeader>
    <CardTitle>Images</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {property.images.map((image, index) => (
        <div key={index} className="relative aspect-video">
          <img
            src={image}
            alt={`Property image ${index + 1}`}
            className="object-cover rounded-lg w-full h-full"
          />
        </div>
      ))}
    </div>
  </CardContent>
</Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{property.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside">
            {property.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{property.type === 'hotel' ? 'Rooms' : 'Occupancy Types'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {property.rooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-4">
                {renderRoomInfo(room)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="font-medium">Check-in Time</dt>
              <dd>{property.policies.checkIn}</dd>
            </div>
            <div>
              <dt className="font-medium">Check-out Time</dt>
              <dd>{property.policies.checkOut}</dd>
            </div>
            {'couplesWelcome' in property.policies && (
              <div>
                <dt className="font-medium">Couples Welcome</dt>
                <dd>{property.policies.couplesWelcome ? 'Yes' : 'No'}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {property.type === 'hostel' && 'foodMenu' in property && (
        <Card>
          <CardHeader>
            <CardTitle>Food Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {property.foodMenu.map((menu, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{menu.day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <h4 className="font-medium">Breakfast</h4>
                      <ul className="list-disc list-inside">
                        {menu.breakfast.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Lunch</h4>
                      <ul className="list-disc list-inside">
                        {menu.lunch.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Dinner</h4>
                      <ul className="list-disc list-inside">
                        {menu.dinner.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

