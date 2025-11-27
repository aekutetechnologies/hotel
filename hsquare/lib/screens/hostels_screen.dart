import 'package:flutter/material.dart';
import 'package:hsquare/screens/search_screen.dart';

class HostelsScreen extends StatelessWidget {
  const HostelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const SearchScreen(propertyType: 'hostel');
  }
}
