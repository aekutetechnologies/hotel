import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme_config.dart';
import 'providers/auth_provider.dart';
import 'providers/property_provider.dart';
import 'providers/booking_provider.dart';
import 'providers/favorites_provider.dart';
import 'services/storage_service.dart';
import 'screens/home/home_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/property_list_screen.dart';
import 'screens/property/property_detail_screen.dart';
import 'screens/property/search_screen.dart';
import 'screens/booking/booking_screen.dart';
import 'screens/booking/booking_list_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/blog/blog_list_screen.dart';
import 'screens/blog/blog_detail_screen.dart';
import 'models/blog.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize storage service
  await StorageService.init();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => FavoritesProvider()),
      ],
      child: MaterialApp(
        title: 'Hsquare',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const AppInitializer(),
        routes: {
          '/': (context) => const HomeScreen(),
          '/login': (context) => const LoginScreen(),
          '/search': (context) => const SearchScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/blog': (context) => const BlogListScreen(),
        },
        onGenerateRoute: (settings) {
          final uri = Uri.parse(settings.name!);
          
          // Property routes
          if (uri.path.startsWith('/property/')) {
            final segments = uri.pathSegments;
            if (segments.length >= 2) {
              final propertyId = int.tryParse(segments[1]);
              if (propertyId != null) {
                return MaterialPageRoute(
                  builder: (context) => PropertyDetailScreen(propertyId: propertyId),
                );
              }
            }
          }
          
          // Booking routes
          if (uri.path.startsWith('/booking/')) {
            final segments = uri.pathSegments;
            if (segments.length >= 2) {
              final bookingId = int.tryParse(segments[1]);
              if (bookingId != null) {
                return MaterialPageRoute(
                  builder: (context) => BookingListScreen(),
                );
              }
            }
          }
          
          // Blog routes
          if (uri.path.startsWith('/blog/')) {
            final segments = uri.pathSegments;
            if (segments.length >= 2) {
              final blogSlug = segments[1];
                return MaterialPageRoute(
                  builder: (context) => BlogDetailScreen(
                    blog: Blog(
                      id: 0,
                      title: '',
                      slug: blogSlug,
                      content: '',
                      excerpt: null,
                      featuredImage: null,
                      viewCount: null,
                      createdAt: DateTime.now(),
                      updatedAt: DateTime.now(),
                      author: null,
                      category: null,
                      tags: null,
                    ),
                  ),
                );
            }
          }
          
          return null;
        },
      ),
    );
  }
}

class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // Initialize auth provider
      await context.read<AuthProvider>().initialize();
    } catch (e) {
      debugPrint('Error initializing app: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return const HomeScreen();
  }
}