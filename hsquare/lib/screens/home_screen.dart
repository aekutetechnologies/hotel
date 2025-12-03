import 'package:flutter/material.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:hsquare/screens/hotels_screen.dart';
import 'package:hsquare/screens/hostels_screen.dart';
import 'package:provider/provider.dart';
import 'package:hsquare/providers/auth_provider.dart';
import 'package:hsquare/screens/login_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(context),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 20),
                    Text(
                      'Where would you like to stay?',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: AppColors.primaryRed,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 30),
                    _buildSelectionCard(
                      context,
                      title: 'Hotels',
                      description: 'Luxury stays with premium amenities',
                      subDescription: 'Perfect for business and leisure',
                      color: AppColors.primaryRed,
                      imagePath: 'assets/images/hotels.png',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const HotelsScreen()),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    _buildSelectionCard(
                      context,
                      title: 'Hostels',
                      description: 'Affordable community living',
                      subDescription: 'Ideal for students and backpackers',
                      color: AppColors.primaryGrey,
                      imagePath: 'assets/images/hostels.png',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const HostelsScreen()),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo
          Image.asset(
            'assets/images/logo.png',
            height: 30, // Adjust height as needed
            errorBuilder: (context, error, stackTrace) {
              return const Text(
                'HSquare',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryRed,
                ),
              );
            },
          ),
          if (authProvider.isAuthenticated)
            PopupMenuButton<String>(
              onSelected: (value) async {
                if (value == 'logout') {
                  authProvider.logout();
                } else if (value == 'profile') {
                  Navigator.pushNamed(context, '/profile');
                } else if (value == 'bookings') {
                  Navigator.pushNamed(context, '/bookings');
                } else if (value == 'favorites') {
                  Navigator.pushNamed(context, '/favorites');
                } else if (value == 'blog') {
                  Navigator.pushNamed(context, '/blog');
                }
              },
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primaryRed,
                    radius: 16,
                    child: Text(
                      authProvider.userName?.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    authProvider.userName ?? 'User',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              itemBuilder: (BuildContext context) {
                return [
                  const PopupMenuItem<String>(
                    value: 'profile',
                    child: Row(
                      children: [
                        Icon(Icons.person, size: 20),
                        SizedBox(width: 8),
                        Text('Profile'),
                      ],
                    ),
                  ),
                  const PopupMenuItem<String>(
                    value: 'bookings',
                    child: Row(
                      children: [
                        Icon(Icons.event, size: 20),
                        SizedBox(width: 8),
                        Text('My Bookings'),
                      ],
                    ),
                  ),
                  const PopupMenuItem<String>(
                    value: 'favorites',
                    child: Row(
                      children: [
                        Icon(Icons.favorite, size: 20),
                        SizedBox(width: 8),
                        Text('Favorites'),
                      ],
                    ),
                  ),
                  const PopupMenuItem<String>(
                    value: 'blog',
                    child: Row(
                      children: [
                        Icon(Icons.article, size: 20),
                        SizedBox(width: 8),
                        Text('Blog'),
                      ],
                    ),
                  ),
                  const PopupMenuDivider(),
                  const PopupMenuItem<String>(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout, size: 20),
                        SizedBox(width: 8),
                        Text('Logout'),
                      ],
                    ),
                  ),
                ];
              },
            )
          else
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                );
              },
              icon: const Icon(Icons.login, size: 18),
              label: const Text('Login / Signup'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryRed,
                foregroundColor: Colors.white,
                textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSelectionCard(
    BuildContext context, {
    required String title,
    required String description,
    required String subDescription,
    required Color color,
    required String imagePath,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          children: [
            // Image Section
            Container(
              height: 180,
              width: double.infinity,
              color: Colors.grey.shade200,
              child: Stack(
                children: [
                  Image.asset(
                    imagePath,
                    width: double.infinity,
                    height: double.infinity,
                    fit: BoxFit.cover,
                  ),
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                      color: color,
                      child: Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Content Section
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          description,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          subDescription,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.chevron_right, color: color),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
