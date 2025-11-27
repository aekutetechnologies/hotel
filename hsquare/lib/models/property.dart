class Property {
  final int id;
  final String name;
  final String propertyType;
  final String? description;
  final String location;
  final String? city;
  final String? state;
  final String? country;
  final List<PropertyImage> images;
  final double? rating; // Derived or from reviews
  final List<Room> rooms;

  Property({
    required this.id,
    required this.name,
    required this.propertyType,
    this.description,
    required this.location,
    this.city,
    this.state,
    this.country,
    required this.images,
    this.rating,
    required this.rooms,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'],
      name: json['name'],
      propertyType: json['property_type'] ?? 'hotel',
      description: json['description'],
      location: json['location'],
      city: json['city'] is Map ? json['city']['name'] : json['city'],
      state: json['state'] is Map ? json['state']['name'] : json['state'],
      country: json['country'] is Map ? json['country']['name'] : json['country'],
      images: (json['images'] as List?)
              ?.map((i) => PropertyImage.fromJson(i))
              .toList() ??
          [],
      rooms: (json['rooms'] as List?)
              ?.map((i) => Room.fromJson(i))
              .toList() ??
          [],
      rating: 0.0, // Placeholder, calculate from reviews if needed
    );
  }
}

class PropertyImage {
  final int id;
  final String imageUrl;

  PropertyImage({required this.id, required this.imageUrl});

  factory PropertyImage.fromJson(Map<String, dynamic> json) {
    return PropertyImage(
      id: json['id'],
      imageUrl: json['image'],
    );
  }
}

class Room {
  final int id;
  final String name;
  final double dailyRate;

  Room({required this.id, required this.name, required this.dailyRate});

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'],
      name: json['name'],
      dailyRate: double.tryParse(json['daily_rate'].toString()) ?? 0.0,
    );
  }
}
