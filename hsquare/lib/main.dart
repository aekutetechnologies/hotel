import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:hsquare/providers/auth_provider.dart';
import 'package:hsquare/screens/home_screen.dart';
import 'package:hsquare/screens/profile_screen.dart';
import 'package:hsquare/screens/bookings_screen.dart';
import 'package:hsquare/screens/favorites_screen.dart';
import 'package:hsquare/screens/blog_list_screen.dart';
import 'package:hsquare/utils/constants.dart';

void main() {
  runApp(const HSquareApp());
}

class HSquareApp extends StatelessWidget {
  const HSquareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..checkLoginStatus()),
      ],
      child: MaterialApp(
        title: 'HSquare',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primaryRed),
          useMaterial3: true,
          textTheme: GoogleFonts.poppinsTextTheme(),
          scaffoldBackgroundColor: AppColors.background,
        ),
        home: const HomeScreen(),
        routes: {
          '/profile': (context) => const ProfileScreen(),
          '/bookings': (context) => const BookingsScreen(),
          '/favorites': (context) => const FavoritesScreen(),
          '/blog': (context) => const BlogListScreen(),
        },
      ),
    );
  }
}
