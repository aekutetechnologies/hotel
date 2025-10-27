import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:hotel_mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Hotel Mobile App Integration Tests', () {
    testWidgets('app launches and shows home screen', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Verify home screen elements are present
      expect(find.text('Where would you like to stay?'), findsOneWidget);
      expect(find.text('Hotels'), findsOneWidget);
      expect(find.text('Hostels'), findsOneWidget);
    });

    testWidgets('can navigate to login screen', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Tap on profile icon to navigate to login
      await tester.tap(find.byIcon(Icons.person));
      await tester.pumpAndSettle();

      // Verify login screen elements
      expect(find.text('Login'), findsOneWidget);
      expect(find.text('Enter your phone number'), findsOneWidget);
    });

    testWidgets('can navigate to search screen', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Tap on search icon
      await tester.tap(find.byIcon(Icons.search));
      await tester.pumpAndSettle();

      // Verify search screen elements
      expect(find.text('Search Properties'), findsOneWidget);
      expect(find.text('Location'), findsOneWidget);
    });

    testWidgets('can navigate to blog screen', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate to blog (assuming there's a blog button in the app)
      // This test would need to be updated based on actual navigation
      await tester.tap(find.byIcon(Icons.article));
      await tester.pumpAndSettle();

      // Verify blog screen elements
      expect(find.text('Blog'), findsOneWidget);
    });

    testWidgets('hotels and hostels selection works', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Tap on Hotels card
      await tester.tap(find.text('Hotels'));
      await tester.pumpAndSettle();

      // Verify navigation to property list
      expect(find.text('Properties'), findsOneWidget);
    });

    testWidgets('can navigate back from property list', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Navigate to hotels
      await tester.tap(find.text('Hotels'));
      await tester.pumpAndSettle();

      // Navigate back
      await tester.tap(find.byIcon(Icons.arrow_back));
      await tester.pumpAndSettle();

      // Verify we're back at home screen
      expect(find.text('Where would you like to stay?'), findsOneWidget);
    });
  });
}
