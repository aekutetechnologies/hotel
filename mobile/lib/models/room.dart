class Room {
  final int id;
  final String name;
  final String? type;
  final String? occupancyType;
  final int? capacity;
  final int? availableBeds;
  final int? totalBeds;
  final String? hourlyRate;
  final String? dailyRate;
  final String? monthlyRate;
  final String? discount;
  final bool? security;
  final int? quantity;
  final List<Amenity>? amenities;
  final List<RoomImage>? images;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Room({
    required this.id,
    required this.name,
    this.type,
    this.occupancyType,
    this.capacity,
    this.availableBeds,
    this.totalBeds,
    this.hourlyRate,
    this.dailyRate,
    this.monthlyRate,
    this.discount,
    this.security,
    this.quantity,
    this.amenities,
    this.images,
    this.createdAt,
    this.updatedAt,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      type: json['type'],
      occupancyType: json['occupancy_type'],
      capacity: json['capacity'],
      availableBeds: json['available_beds'],
      totalBeds: json['total_beds'],
      hourlyRate: json['hourly_rate'],
      dailyRate: json['daily_rate'],
      monthlyRate: json['monthly_rate'],
      discount: json['discount'],
      security: json['security'],
      quantity: json['quantity'],
      amenities: json['amenities'] != null
          ? (json['amenities'] as List)
              .map((amenity) => Amenity.fromJson(amenity))
              .toList()
          : null,
      images: json['images'] != null
          ? (json['images'] as List)
              .map((image) => RoomImage.fromJson(image))
              .toList()
          : null,
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
      updatedAt: json['updated_at'] != null 
          ? DateTime.tryParse(json['updated_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'occupancy_type': occupancyType,
      'capacity': capacity,
      'available_beds': availableBeds,
      'total_beds': totalBeds,
      'hourly_rate': hourlyRate,
      'daily_rate': dailyRate,
      'monthly_rate': monthlyRate,
      'discount': discount,
      'security': security,
      'quantity': quantity,
      'amenities': amenities?.map((amenity) => amenity.toJson()).toList(),
      'images': images?.map((image) => image.toJson()).toList(),
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Room(id: $id, name: $name, type: $type, capacity: $capacity)';
  }
}

class Amenity {
  final int id;
  final String name;
  final String? icon;
  final bool? isActive;

  Amenity({
    required this.id,
    required this.name,
    this.icon,
    this.isActive,
  });

  factory Amenity.fromJson(Map<String, dynamic> json) {
    return Amenity(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      icon: json['icon'],
      isActive: json['is_active'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'is_active': isActive,
    };
  }

  @override
  String toString() {
    return 'Amenity(id: $id, name: $name)';
  }
}

class RoomImage {
  final int id;
  final String image;
  final String? category;
  final DateTime? createdAt;

  RoomImage({
    required this.id,
    required this.image,
    this.category,
    this.createdAt,
  });

  factory RoomImage.fromJson(Map<String, dynamic> json) {
    return RoomImage(
      id: json['id'] ?? 0,
      image: json['image'] ?? '',
      category: json['category'],
      createdAt: json['created_at'] != null 
          ? DateTime.tryParse(json['created_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'image': image,
      'category': category,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'RoomImage(id: $id, image: $image)';
  }
}
