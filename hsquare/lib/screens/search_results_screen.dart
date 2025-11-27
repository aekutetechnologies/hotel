import 'package:flutter/material.dart';
import 'package:hsquare/widgets/property_list.dart';

class SearchResultsScreen extends StatelessWidget {
  final String propertyType;
  final String location;
  final DateTime checkIn;
  final DateTime checkOut;
  final int guests;
  final int rooms;

  const SearchResultsScreen({
    super.key,
    required this.propertyType,
    required this.location,
    required this.checkIn,
    required this.checkOut,
    required this.guests,
    required this.rooms,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${propertyType == 'hotel' ? 'Hotels' : 'Hostels'} in $location')),
      body: PropertyList(
        propertyType: propertyType,
        location: location, // Pass location to filter
      ),
    );
  }
}
