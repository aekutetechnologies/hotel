import 'package:flutter/material.dart';
import 'package:hsquare/screens/search_screen.dart';

class HotelsScreen extends StatelessWidget {
  const HotelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const SearchScreen(propertyType: 'hotel');
  }
}
