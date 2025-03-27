import { authenticateJWT } from '../middleware/auth';

// Add public search endpoint
router.get('/public/search', async (req, res) => {
  try {
    const {
      location,
      propertyType,
      bookingType,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      months,
      rooms,
      guests
    } = req.query;

    console.log('Public search params:', req.query);

    // Build the query based on the provided parameters
    const query: any = {};
    
    if (location) {
      query.location = { $regex: new RegExp(location as string, 'i') };
    }

    if (propertyType && propertyType !== 'all') {
      query.property_type = propertyType;
    }

    // Add logic for availability based on dates if needed
    // This would check if rooms are available for the specified dates

    const properties = await Property.find(query)
      .populate('amenities')
      .populate('rooms')
      .populate('location_details')
      .populate({
        path: 'rooms',
        populate: {
          path: 'amenities',
          model: 'Amenity'
        }
      });

    console.log(`Found ${properties.length} properties for public search`);
    
    return res.status(200).json(properties);
  } catch (error) {
    console.error('Error in public property search:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); 