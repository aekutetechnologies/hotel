import 'package:flutter/material.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:url_launcher/url_launcher.dart';

class AppFooter extends StatelessWidget {
  const AppFooter({super.key});

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.primaryRed,
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // About Us Section
          const Text(
            'About Us',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'At HSquare Living, we are more than just a team; we are a closely-knit family of handpicked individuals, each possessing exceptional expertise and a shared passion for excellence. Discover luxury and comfort with our carefully curated selection of premium hotels across India.',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          // Social Media Icons
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.circle, color: Colors.white, size: 32),
                onPressed: () => _launchUrl('https://instagram.com'),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Text(
                  'f',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                onPressed: () => _launchUrl('https://facebook.com'),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Text(
                  'in',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                onPressed: () => _launchUrl('https://linkedin.com'),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          const SizedBox(height: 32),

          // Quick Links Section
          const Text(
            'Quick Links',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          _buildLink('Careers', () {}),
          _buildLink('Refund Policy', () {}),
          _buildLink('Cancellation Policy', () {}),
          _buildLink('Terms & Conditions', () {}),
          _buildLink('Privacy Policy', () {}),
          const SizedBox(height: 32),

          // Contact Section
          const Text(
            'Contact',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.email, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: GestureDetector(
                  onTap: () => _launchUrl('mailto:booking@hsquareliving.com'),
                  child: const Text(
                    'booking@hsquareliving.com',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.phone, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: GestureDetector(
                  onTap: () => _launchUrl('tel:+917400455087'),
                  child: const Text(
                    '+917400455087',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: const Text(
                  '4R8P+FHV, Juhu Galli, above Tata Motors Showroom, Mahavi Darshan, Dhangar wadi, Andheri West, Mumbai, Maharashtra 400049',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Copyright
          const Center(
            child: Text(
              '© 2025 HSquare Living. All rights reserved.',
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLink(String text, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: GestureDetector(
        onTap: onTap,
        child: Text(
          text,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            decoration: TextDecoration.underline,
          ),
        ),
      ),
    );
  }
}

