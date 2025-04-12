import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Property } from '@/types/property'

interface PropertyDetailsProps {
  property: Property
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const renderRoomInfo = (room: any) => {
    return (
      <div>
        <h3 className="text-lg font-semibold">{room.name || room.occupancyType || 'Room'}</h3>
        {room.description && <p className="text-sm text-gray-600">{room.description}</p>}
        
        {/* Show size if available */}
        {room.size && <p className="text-sm text-gray-600">Size: {room.size}</p>}
        
        {/* Show max occupancy if available */}
        {room.maxOccupancy && <p className="text-sm text-gray-600">Max Occupancy: {room.maxOccupancy}</p>}
        
        {/* Show beds info if available */}
        {(room.availableBeds || room.totalBeds) && (
          <p className="text-sm text-gray-600">
            Available Beds: {room.availableBeds || '?'} / {room.totalBeds || '?'}
          </p>
        )}
        
        {/* Show price with appropriate label */}
        <p className="text-sm font-semibold">
          Price: ₹{room.basePrice || room.daily_rate || 0}
          {room.monthly_rate ? '/month' : '/night'}
        </p>
      </div>
    )
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
              <dd>{property.property_type}</dd>
            </div>
            <div>
              <dt className="font-medium">Location</dt>
              <dd>{property.location}</dd>
            </div>
            <div>
              <dt className="font-medium">Status</dt>
              <dd>
                <Badge variant="secondary">
                  {property.is_active ? 'Active' : 'Inactive'}
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
            {property.images?.map((image, index) => (
              <div key={index} className="relative aspect-video">
                <img
                  src={typeof image === 'string' ? image : (image.image_url || image.image || '')}
                  alt={`Property image ${index + 1}`}
                  className="object-cover rounded-lg w-full h-full"
                  loading="lazy"
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
            {property.amenities?.map((amenity, index) => (
              <li key={index}>{typeof amenity === 'string' ? amenity : amenity.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {property.rooms && property.rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{property.property_type === 'hostel' ? 'Occupancy Types' : 'Rooms'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {property.rooms.map((room: any) => (
                <div key={room.id} className="border rounded-lg p-4">
                  {renderRoomInfo(room)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

