import 'property.dart';
import 'room.dart';
import 'user.dart';

class Booking {
  final int id;
  final Property property;
  final List<BookingRoom> rooms;
  final User user;
  final DateTime checkInDate;
  final DateTime checkOutDate;
  final int numberOfGuests;
  final String status;
  final String? totalAmount;
  final String? paymentStatus;
  final String? specialRequests;
  final List<BookingDocument>? documents;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Booking({
    required this.id,
    required this.property,
    required this.rooms,
    required this.user,
    required this.checkInDate,
    required this.checkOutDate,
    required this.numberOfGuests,
    required this.status,
    this.totalAmount,
    this.paymentStatus,
    this.specialRequests,
    this.documents,
    required this.createdAt,
    this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] ?? 0,
      property: Property.fromJson(json['property'] ?? {}),
      rooms: json['rooms'] != null
          ? (json['rooms'] as List)
              .map((room) => BookingRoom.fromJson(room))
              .toList()
          : [],
      user: User.fromJson(json['user'] ?? {}),
      checkInDate: json['check_in_date'] != null 
          ? DateTime.parse(json['check_in_date']) 
          : DateTime.now(),
      checkOutDate: json['check_out_date'] != null 
          ? DateTime.parse(json['check_out_date']) 
          : DateTime.now(),
      numberOfGuests: json['number_of_guests'] ?? 1,
      status: json['status'] ?? 'pending',
      totalAmount: json['total_amount'],
      paymentStatus: json['payment_status'],
      specialRequests: json['special_requests'],
      documents: json['documents'] != null
          ? (json['documents'] as List)
              .map((doc) => BookingDocument.fromJson(doc))
              .toList()
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
      'property': property.toJson(),
      'rooms': rooms.map((room) => room.toJson()).toList(),
      'user': user.toJson(),
      'check_in_date': checkInDate.toIso8601String(),
      'check_out_date': checkOutDate.toIso8601String(),
      'number_of_guests': numberOfGuests,
      'status': status,
      'total_amount': totalAmount,
      'payment_status': paymentStatus,
      'special_requests': specialRequests,
      'documents': documents?.map((doc) => doc.toJson()).toList(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Helper methods
  int get numberOfNights {
    return checkOutDate.difference(checkInDate).inDays;
  }

  bool get isActive {
    return status == 'confirmed' || status == 'pending';
  }

  bool get isCompleted {
    return status == 'completed';
  }

  bool get isCancelled {
    return status == 'cancelled';
  }

  @override
  String toString() {
    return 'Booking(id: $id, property: ${property.name}, status: $status, checkIn: $checkInDate)';
  }
}

class BookingRoom {
  final int id;
  final Room room;
  final int quantity;
  final String? rate;
  final String? totalAmount;

  BookingRoom({
    required this.id,
    required this.room,
    required this.quantity,
    this.rate,
    this.totalAmount,
  });

  factory BookingRoom.fromJson(Map<String, dynamic> json) {
    return BookingRoom(
      id: json['id'] ?? 0,
      room: Room.fromJson(json['room'] ?? {}),
      quantity: json['quantity'] ?? 1,
      rate: json['rate'],
      totalAmount: json['total_amount'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'room': room.toJson(),
      'quantity': quantity,
      'rate': rate,
      'total_amount': totalAmount,
    };
  }

  @override
  String toString() {
    return 'BookingRoom(id: $id, room: ${room.name}, quantity: $quantity)';
  }
}

class BookingDocument {
  final int id;
  final String name;
  final String file;
  final String? fileType;
  final DateTime createdAt;

  BookingDocument({
    required this.id,
    required this.name,
    required this.file,
    this.fileType,
    required this.createdAt,
  });

  factory BookingDocument.fromJson(Map<String, dynamic> json) {
    return BookingDocument(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      file: json['file'] ?? '',
      fileType: json['file_type'],
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'file': file,
      'file_type': fileType,
      'created_at': createdAt.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'BookingDocument(id: $id, name: $name, file: $file)';
  }
}
