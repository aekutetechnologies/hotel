class Booking {
  final int id;
  final int propertyId;
  final PropertyInfo property;
  final int roomId;
  final String checkInDate;
  final String checkOutDate;
  final String? checkInTime;
  final String? checkOutTime;
  final String status;
  final String bookingType;
  final double price;
  final double discount;
  final int numberOfGuests;
  final int numberOfRooms;
  final String? paymentType;
  final bool isReviewCreated;
  final int? reviewId;
  final DateTime createdAt;

  Booking({
    required this.id,
    required this.propertyId,
    required this.property,
    required this.roomId,
    required this.checkInDate,
    required this.checkOutDate,
    this.checkInTime,
    this.checkOutTime,
    required this.status,
    required this.bookingType,
    required this.price,
    required this.discount,
    required this.numberOfGuests,
    required this.numberOfRooms,
    this.paymentType,
    required this.isReviewCreated,
    this.reviewId,
    required this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      propertyId: json['property'] is int ? json['property'] : json['property']['id'],
      property: PropertyInfo.fromJson(
        json['property'] is int 
          ? {'id': json['property'], 'name': '', 'location': ''}
          : json['property']
      ),
      roomId: json['room'],
      checkInDate: json['checkin_date'],
      checkOutDate: json['checkout_date'],
      checkInTime: json['checkin_time'],
      checkOutTime: json['checkout_time'],
      status: json['status'],
      bookingType: json['booking_type'] ?? json['booking_time'],
      price: (json['price'] ?? 0.0).toDouble(),
      discount: (json['discount'] ?? 0.0).toDouble(),
      numberOfGuests: json['number_of_guests'] ?? 1,
      numberOfRooms: json['number_of_rooms'] ?? 1,
      paymentType: json['payment_type'],
      isReviewCreated: json['is_review_created'] ?? false,
      reviewId: json['review_id'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

class PropertyInfo {
  final int id;
  final String name;
  final String location;
  final String? imageUrl;

  PropertyInfo({
    required this.id,
    required this.name,
    required this.location,
    this.imageUrl,
  });

  factory PropertyInfo.fromJson(Map<String, dynamic> json) {
    String? imageUrl;
    if (json['images'] != null && json['images'].isNotEmpty) {
      if (json['images'][0] is Map) {
        imageUrl = json['images'][0]['image'] ?? json['images'][0]['image_url'];
      } else {
        imageUrl = json['images'][0];
      }
    }
    
    return PropertyInfo(
      id: json['id'],
      name: json['name'],
      location: json['location'],
      imageUrl: imageUrl,
    );
  }
}

class BookingRequest {
  final int propertyId;
  final int roomId;
  final String checkInDate;
  final String checkOutDate;
  final String? checkInTime;
  final String? checkOutTime;
  final int numberOfGuests;
  final int numberOfRooms;
  final String bookingType;
  final String paymentType;
  final double price;
  final double discount;
  final int? offerId;
  final Map<String, int> bookingRoomTypes;

  BookingRequest({
    required this.propertyId,
    required this.roomId,
    required this.checkInDate,
    required this.checkOutDate,
    this.checkInTime,
    this.checkOutTime,
    required this.numberOfGuests,
    required this.numberOfRooms,
    required this.bookingType,
    required this.paymentType,
    required this.price,
    required this.discount,
    this.offerId,
    required this.bookingRoomTypes,
  });

  Map<String, dynamic> toJson() {
    final List<Map<String, int>> roomTypesList = 
        bookingRoomTypes.entries.map((e) => {e.key: e.value}).toList();
    
    return {
      'property': propertyId,
      'room': roomId,
      'checkin_date': checkInDate,
      'checkout_date': checkOutDate,
      if (checkInTime != null) 'checkin_time': checkInTime,
      if (checkOutTime != null) 'checkout_time': checkOutTime,
      'number_of_guests': numberOfGuests,
      'number_of_rooms': numberOfRooms,
      'booking_type': bookingType,
      'booking_time': bookingType,
      'payment_type': paymentType,
      'status': 'pending',
      'price': price,
      'discount': discount,
      if (offerId != null) 'offer_id': offerId,
      'booking_room_types': roomTypesList,
    };
  }
}

