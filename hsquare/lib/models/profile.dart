class UserProfile {
  final int id;
  final String name;
  final String email;
  final String mobile;
  final String userRole;
  final DateTime createdAt;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.mobile,
    required this.userRole,
    required this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      name: json['name'],
      email: json['email'] ?? '',
      mobile: json['mobile'],
      userRole: json['user_role'] ?? 'customer',
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
    };
  }
}

