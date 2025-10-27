import 'room.dart';
import 'user.dart';

class Property {
  final int id;
  final String name;
  final String? description;
  final String? type;
  final String? location;
  final String? area;
  final String? city;
  final String? state;
  final String? country;
  final String? latitude;
  final String? longitude;
  final String? checkInTime;
  final String? checkOutTime;
  final String? securityDeposit;
  final bool? isActive;
  final List<PropertyImage>? images;
  final List<Room>? rooms;
  final List<Amenity>? amenities;
  final List<Rule>? rules;
  final List<Documentation>? documentation;
  final List<Review>? reviews;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Property({
    required this.id,
    required this.name,
    this.description,
    this.type,
    this.location,
    this.area,
    this.city,
    this.state,
    this.country,
    this.latitude,
    this.longitude,
    this.checkInTime,
    this.checkOutTime,
    this.securityDeposit,
    this.isActive,
    this.images,
    this.rooms,
    this.amenities,
    this.rules,
    this.documentation,
    this.reviews,
    this.createdAt,
    this.updatedAt,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'],
      type: json['type'],
      location: json['location'],
      area: json['area'],
      city: json['city']?['name'],
      state: json['state']?['name'],
      country: json['country']?['name'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      checkInTime: json['check_in_time'],
      checkOutTime: json['check_out_time'],
      securityDeposit: json['security_deposit']?.toString(),
      isActive: json['is_active'],
      images: json['images'] != null
          ? (json['images'] as List)
              .map((image) => PropertyImage.fromJson(image))
              .toList()
          : null,
      rooms: json['rooms'] != null
          ? (json['rooms'] as List)
              .map((room) => Room.fromJson(room))
              .toList()
          : null,
      amenities: json['amenities'] != null
          ? (json['amenities'] as List)
              .map((amenity) => Amenity.fromJson(amenity))
              .toList()
          : null,
      rules: json['rules'] != null
          ? (json['rules'] as List)
              .map((rule) => Rule.fromJson(rule))
              .toList()
          : null,
      documentation: json['documentation'] != null
          ? (json['documentation'] as List)
              .map((doc) => Documentation.fromJson(doc))
              .toList()
          : null,
      reviews: json['reviews'] != null
          ? (json['reviews'] as List)
              .map((review) => Review.fromJson(review))
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
      'description': description,
      'type': type,
      'location': location,
      'area': area,
      'city': city,
      'state': state,
      'country': country,
      'latitude': latitude,
      'longitude': longitude,
      'check_in_time': checkInTime,
      'check_out_time': checkOutTime,
      'security_deposit': securityDeposit,
      'is_active': isActive,
      'images': images?.map((image) => image.toJson()).toList(),
      'rooms': rooms?.map((room) => room.toJson()).toList(),
      'amenities': amenities?.map((amenity) => amenity.toJson()).toList(),
      'rules': rules?.map((rule) => rule.toJson()).toList(),
      'documentation': documentation?.map((doc) => doc.toJson()).toList(),
      'reviews': reviews?.map((review) => review.toJson()).toList(),
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Helper methods
  String get fullLocation {
    final parts = <String>[];
    if (area != null && area!.isNotEmpty) parts.add(area!);
    if (city != null && city!.isNotEmpty) parts.add(city!);
    if (state != null && state!.isNotEmpty) parts.add(state!);
    if (country != null && country!.isNotEmpty) parts.add(country!);
    return parts.join(', ');
  }

  String? get primaryImage {
    return images?.isNotEmpty == true ? images!.first.image : null;
  }

  double get averageRating {
    if (reviews == null || reviews!.isEmpty) return 0.0;
    final totalRating = reviews!.fold<double>(0, (sum, review) => sum + review.rating);
    return totalRating / reviews!.length;
  }

  @override
  String toString() {
    return 'Property(id: $id, name: $name, type: $type, location: $fullLocation)';
  }
}

class PropertyImage {
  final int id;
  final String image;
  final String? category;
  final DateTime? createdAt;

  PropertyImage({
    required this.id,
    required this.image,
    this.category,
    this.createdAt,
  });

  factory PropertyImage.fromJson(Map<String, dynamic> json) {
    return PropertyImage(
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
    return 'PropertyImage(id: $id, image: $image)';
  }
}

class Rule {
  final int id;
  final String name;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Rule({
    required this.id,
    required this.name,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory Rule.fromJson(Map<String, dynamic> json) {
    return Rule(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      isActive: json['is_active'] ?? false,
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
      'is_active': isActive,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Rule(id: $id, name: $name, isActive: $isActive)';
  }
}

class Documentation {
  final int id;
  final String name;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Documentation({
    required this.id,
    required this.name,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory Documentation.fromJson(Map<String, dynamic> json) {
    return Documentation(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      isActive: json['is_active'] ?? false,
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
      'is_active': isActive,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Documentation(id: $id, name: $name, isActive: $isActive)';
  }
}

class Review {
  final int id;
  final User user;
  final double rating;
  final String review;
  final List<String>? images;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Review({
    required this.id,
    required this.user,
    required this.rating,
    required this.review,
    this.images,
    required this.createdAt,
    this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? 0,
      user: User.fromJson(json['user'] ?? {}),
      rating: (json['rating'] ?? 0).toDouble(),
      review: json['review'] ?? '',
      images: json['images'] != null 
          ? List<String>.from(json['images']) 
          : null,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at']) 
          : DateTime.now(),
      updatedAt: json['updated_at'] != null 
          ? DateTime.tryParse(json['updated_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user.toJson(),
      'rating': rating,
      'review': review,
      'images': images,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Review(id: $id, rating: $rating, review: ${review.substring(0, 50)}...)';
  }
}

