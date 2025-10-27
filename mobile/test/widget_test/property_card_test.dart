import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hotel_mobile/widgets/property_card.dart';
import 'package:hotel_mobile/models/property.dart';
import 'package:hotel_mobile/config/theme_config.dart';

void main() {
  group('PropertyCard Widget Tests', () {
    Property createTestProperty() {
      return Property(
        id: 1,
        name: 'Test Hotel',
        type: 'hotel',
        location: 'Test City',
        fullLocation: 'Test City, Test State',
        description: 'A test hotel for testing',
        images: null,
        amenities: null,
        rooms: null,
        reviews: null,
        averageRating: 4.5,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }

    testWidgets('renders property card with basic information', (WidgetTester tester) async {
      final property = createTestProperty();
      
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: PropertyCard(
              property: property,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('Test Hotel'), findsOneWidget);
      expect(find.text('Test City, Test State'), findsOneWidget);
    });

    testWidgets('calls onTap when card is tapped', (WidgetTester tester) async {
      final property = createTestProperty();
      bool wasTapped = false;
      
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: PropertyCard(
              property: property,
              onTap: () {
                wasTapped = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(PropertyCard));
      await tester.pump();

      expect(wasTapped, isTrue);
    });

    testWidgets('calls onFavoriteTap when favorite button is tapped', (WidgetTester tester) async {
      final property = createTestProperty();
      bool favoriteWasTapped = false;
      
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: PropertyCard(
              property: property,
              onTap: () {},
              onFavoriteTap: () {
                favoriteWasTapped = true;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.favorite_border));
      await tester.pump();

      expect(favoriteWasTapped, isTrue);
    });

    testWidgets('shows correct type badge for hotel', (WidgetTester tester) async {
      final property = createTestProperty();
      
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: PropertyCard(
              property: property,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('HOTEL'), findsOneWidget);
    });

    testWidgets('shows correct type badge for hostel', (WidgetTester tester) async {
      final property = createTestProperty();
      property.type = 'hostel';
      
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: PropertyCard(
              property: property,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('HOSTEL'), findsOneWidget);
    });

    testWidgets('displays rating when available', (WidgetTester tester) async {
      final property = createTestProperty();
      property.averageRating = 4.5;
      
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.lightTheme,
          home: Scaffold(
            body: PropertyCard(
              property: property,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('4.5'), findsOneWidget);
    });
  });
}
