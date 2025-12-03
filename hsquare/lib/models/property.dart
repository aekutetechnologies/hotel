class Property {
  final int id;
  final String name;
  final String propertyType;
  final String? description;
  final String location;
  final String? city;
  final String? state;
  final String? country;
  final String? latitude;
  final String? longitude;
  final List<PropertyImage> images;
  final double? rating;
  final int? reviewCount;
  final List<Room> rooms;
  final List<Amenity> amenities;
  final List<Review> reviews;
  final List<Rule> rules;
  final List<Documentation> documentation;
  final String? checkInTime;
  final String? checkOutTime;
  final double? securityDeposit;

  Property({
    required this.id,
    required this.name,
    required this.propertyType,
    this.description,
    required this.location,
    this.city,
    this.state,
    this.country,
    this.latitude,
    this.longitude,
    required this.images,
    this.rating,
    this.reviewCount,
    required this.rooms,
    required this.amenities,
    required this.reviews,
    required this.rules,
    required this.documentation,
    this.checkInTime,
    this.checkOutTime,
    this.securityDeposit,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    // Calculate rating from reviews if not provided
    double? rating = json['rating'];
    int? reviewCount = json['review_count'];
    
    if (rating == null && json['reviews'] != null && (json['reviews'] as List).isNotEmpty) {
      final reviews = (json['reviews'] as List).map((r) => r['rating'] as int).toList();
      if (reviews.isNotEmpty) {
        rating = reviews.reduce((a, b) => a + b) / reviews.length;
        reviewCount = reviews.length;
      }
    }

    return Property(
      id: json['id'],
      name: json['name'],
      propertyType: json['property_type'] ?? 'hotel',
      description: json['description'],
      location: json['location'],
      city: json['city'] is Map ? json['city']['name'] : json['city'],
      state: json['state'] is Map ? json['state']['name'] : json['state'],
      country: json['country'] is Map ? json['country']['name'] : json['country'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      images: (json['images'] as List?)
              ?.map((i) => PropertyImage.fromJson(i))
              .toList() ??
          [],
      rooms: (json['rooms'] as List?)
              ?.map((i) => Room.fromJson(i))
              .toList() ??
          [],
      amenities: (json['amenities'] as List?)
              ?.map((i) => Amenity.fromJson(i))
              .toList() ??
          [],
      reviews: (json['reviews'] as List?)
              ?.map((i) => Review.fromJson(i))
              .toList() ??
          [],
      rules: (json['rules'] as List?)
              ?.map((i) => Rule.fromJson(i))
              .toList() ??
          [],
      documentation: (json['documentation'] as List?)
              ?.map((i) => Documentation.fromJson(i))
              .toList() ??
          [],
      rating: rating,
      reviewCount: reviewCount,
      checkInTime: json['check_in_time'],
      checkOutTime: json['check_out_time'],
      securityDeposit: json['security_deposit'] != null 
          ? double.tryParse(json['security_deposit'].toString())
          : null,
    );
  }
}

class PropertyImage {
  final int id;
  final String imageUrl;
  final ImageCategory? category;

  PropertyImage({required this.id, required this.imageUrl, this.category});

  factory PropertyImage.fromJson(Map<String, dynamic> json) {
    return PropertyImage(
      id: json['id'],
      imageUrl: json['image_url'] ?? json['image'] ?? '',
      category: json['category'] != null ? ImageCategory.fromJson(json['category']) : null,
    );
  }
}

class ImageCategory {
  final int id;
  final String name;
  final String code;

  ImageCategory({required this.id, required this.name, required this.code});

  factory ImageCategory.fromJson(Map<String, dynamic> json) {
    return ImageCategory(
      id: json['id'],
      name: json['name'],
      code: json['code'],
    );
  }
}

class Room {
  final int id;
  final String name;
  final double dailyRate;
  final double? hourlyRate;
  final double? monthlyRate;
  final double? yearlyRate;
  final double? discount;
  final String? size;
  final String? occupancyType;
  final String? bathroomType;
  final bool? smokingAllowed;
  final List<RoomImage> images;
  final List<Amenity> amenities;

  Room({
    required this.id,
    required this.name,
    required this.dailyRate,
    this.hourlyRate,
    this.monthlyRate,
    this.yearlyRate,
    this.discount,
    this.size,
    this.occupancyType,
    this.bathroomType,
    this.smokingAllowed,
    required this.images,
    required this.amenities,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'],
      name: json['name'],
      dailyRate: double.tryParse(json['daily_rate']?.toString() ?? '0') ?? 0.0,
      hourlyRate: json['hourly_rate'] != null ? double.tryParse(json['hourly_rate'].toString()) : null,
      monthlyRate: json['monthly_rate'] != null ? double.tryParse(json['monthly_rate'].toString()) : null,
      yearlyRate: json['yearly_rate'] != null ? double.tryParse(json['yearly_rate'].toString()) : null,
      discount: json['discount'] != null ? double.tryParse(json['discount'].toString()) : null,
      size: json['size'],
      occupancyType: json['occupancy_type'],
      bathroomType: json['bathroom_type'],
      smokingAllowed: json['smoking_allowed'],
      images: (json['images'] as List?)
              ?.map((i) => RoomImage.fromJson(i))
              .toList() ??
          [],
      amenities: (json['amenities'] as List?)
              ?.map((i) => Amenity.fromJson(i))
              .toList() ??
          [],
    );
  }
}

class RoomImage {
  final int id;
  final String imageUrl;

  RoomImage({required this.id, required this.imageUrl});

  factory RoomImage.fromJson(Map<String, dynamic> json) {
    return RoomImage(
      id: json['id'],
      imageUrl: json['image_url'] ?? json['image'] ?? '',
    );
  }
}

class Amenity {
  final int id;
  final String name;
  final String? icon;

  Amenity({required this.id, required this.name, this.icon});

  factory Amenity.fromJson(Map<String, dynamic> json) {
    return Amenity(
      id: json['id'],
      name: json['name'],
      icon: json['icon'],
    );
  }
}

class Review {
  final int id;
  final String userName;
  final int rating;
  final String review;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.userName,
    required this.rating,
    required this.review,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      userName: json['user'] is Map ? json['user']['name'] : json['user_name'] ?? 'Anonymous',
      rating: json['rating'],
      review: json['review'] ?? '',
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class Rule {
  final int id;
  final String name;

  Rule({required this.id, required this.name});

  factory Rule.fromJson(Map<String, dynamic> json) {
    return Rule(
      id: json['id'],
      name: json['name'],
    );
  }
}

class Documentation {
  final int id;
  final String name;

  Documentation({required this.id, required this.name});

  factory Documentation.fromJson(Map<String, dynamic> json) {
    return Documentation(
      id: json['id'],
      name: json['name'],
    );
  }
}
