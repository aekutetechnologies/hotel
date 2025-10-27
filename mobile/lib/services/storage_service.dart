import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _accessTokenKey = 'accessToken';
  static const String _userIdKey = 'userId';
  static const String _userNameKey = 'name';
  static const String _userRoleKey = 'role';
  static const String _userPermissionsKey = 'permissions';
  static const String _userEmailKey = 'email';
  static const String _userMobileKey = 'mobile';
  
  static SharedPreferences? _prefs;
  
  // Initialize SharedPreferences
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }
  
  // Get SharedPreferences instance
  static SharedPreferences get prefs {
    if (_prefs == null) {
      throw Exception('StorageService not initialized. Call StorageService.init() first.');
    }
    return _prefs!;
  }
  
  // Authentication token methods
  static Future<void> setAccessToken(String token) async {
    await prefs.setString(_accessTokenKey, token);
  }
  
  static String? getAccessToken() {
    return prefs.getString(_accessTokenKey);
  }
  
  static Future<void> removeAccessToken() async {
    await prefs.remove(_accessTokenKey);
  }
  
  // User ID methods
  static Future<void> setUserId(String userId) async {
    await prefs.setString(_userIdKey, userId);
  }
  
  static String? getUserId() {
    return prefs.getString(_userIdKey);
  }
  
  static Future<void> removeUserId() async {
    await prefs.remove(_userIdKey);
  }
  
  // User name methods
  static Future<void> setUserName(String name) async {
    await prefs.setString(_userNameKey, name);
  }
  
  static String? getUserName() {
    return prefs.getString(_userNameKey);
  }
  
  static Future<void> removeUserName() async {
    await prefs.remove(_userNameKey);
  }
  
  // User role methods
  static Future<void> setUserRole(String role) async {
    await prefs.setString(_userRoleKey, role);
  }
  
  static String? getUserRole() {
    return prefs.getString(_userRoleKey);
  }
  
  static Future<void> removeUserRole() async {
    await prefs.remove(_userRoleKey);
  }
  
  // User permissions methods
  static Future<void> setUserPermissions(String permissions) async {
    await prefs.setString(_userPermissionsKey, permissions);
  }
  
  static String? getUserPermissions() {
    return prefs.getString(_userPermissionsKey);
  }
  
  static Future<void> removeUserPermissions() async {
    await prefs.remove(_userPermissionsKey);
  }
  
  // User email methods
  static Future<void> setUserEmail(String email) async {
    await prefs.setString(_userEmailKey, email);
  }
  
  static String? getUserEmail() {
    return prefs.getString(_userEmailKey);
  }
  
  static Future<void> removeUserEmail() async {
    await prefs.remove(_userEmailKey);
  }
  
  // User mobile methods
  static Future<void> setUserMobile(String mobile) async {
    await prefs.setString(_userMobileKey, mobile);
  }
  
  static String? getUserMobile() {
    return prefs.getString(_userMobileKey);
  }
  
  static Future<void> removeUserMobile() async {
    await prefs.remove(_userMobileKey);
  }
  
  // Check if user is logged in
  static bool get isLoggedIn {
    final token = getAccessToken();
    final userId = getUserId();
    return token != null && token.isNotEmpty && userId != null && userId.isNotEmpty;
  }
  
  // Get user data as a map
  static Map<String, String?> getUserData() {
    return {
      'accessToken': getAccessToken(),
      'userId': getUserId(),
      'name': getUserName(),
      'role': getUserRole(),
      'permissions': getUserPermissions(),
      'email': getUserEmail(),
      'mobile': getUserMobile(),
    };
  }
  
  // Set user data from a map
  static Future<void> setUserData(Map<String, String> userData) async {
    if (userData.containsKey('accessToken')) {
      await setAccessToken(userData['accessToken']!);
    }
    if (userData.containsKey('userId')) {
      await setUserId(userData['userId']!);
    }
    if (userData.containsKey('name')) {
      await setUserName(userData['name']!);
    }
    if (userData.containsKey('role')) {
      await setUserRole(userData['role']!);
    }
    if (userData.containsKey('permissions')) {
      await setUserPermissions(userData['permissions']!);
    }
    if (userData.containsKey('email')) {
      await setUserEmail(userData['email']!);
    }
    if (userData.containsKey('mobile')) {
      await setUserMobile(userData['mobile']!);
    }
  }
  
  // Clear all user data (logout)
  static Future<void> clearUserData() async {
    await removeAccessToken();
    await removeUserId();
    await removeUserName();
    await removeUserRole();
    await removeUserPermissions();
    await removeUserEmail();
    await removeUserMobile();
  }
  
  // Clear all app data
  static Future<void> clearAll() async {
    await prefs.clear();
  }
}