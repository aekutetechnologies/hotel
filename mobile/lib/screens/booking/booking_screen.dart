import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme_config.dart';
import '../../models/property.dart';
import '../../models/room.dart';
import '../../providers/booking_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_widget.dart';
import '../../services/booking_service.dart';

class BookingScreen extends StatefulWidget {
  final Property property;
  final Room selectedRoom;
  final DateTime checkInDate;
  final DateTime checkOutDate;
  final int numberOfGuests;

  const BookingScreen({
    super.key,
    required this.property,
    required this.selectedRoom,
    required this.checkInDate,
    required this.checkOutDate,
    required this.numberOfGuests,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _specialRequestsController = TextEditingController();
  
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _specialRequestsController.dispose();
    super.dispose();
  }

  void _loadUserData() {
    final authProvider = context.read<AuthProvider>();
    if (authProvider.user != null) {
      _nameController.text = authProvider.user!.name;
      _emailController.text = authProvider.user!.email;
      _phoneController.text = authProvider.user!.mobile;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Booking'),
        backgroundColor: AppTheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const FullScreenLoading(message: 'Processing booking...')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildBookingSummary(context),
                  const SizedBox(height: 24),
                  _buildGuestDetailsForm(context),
                  const SizedBox(height: 24),
                  _buildSpecialRequests(context),
                  const SizedBox(height: 24),
                  _buildBookingSummary(context),
                  const SizedBox(height: 24),
                  _buildBookingButton(context),
                ],
              ),
            ),
    );
  }

  Widget _buildBookingSummary(BuildContext context) {
    final numberOfNights = widget.checkOutDate.difference(widget.checkInDate).inDays;
    final roomRate = double.tryParse(widget.selectedRoom.dailyRate ?? '0') ?? 0;
    final totalAmount = roomRate * numberOfNights;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Booking Summary',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            _buildSummaryRow('Property', widget.property.name),
            _buildSummaryRow('Room', widget.selectedRoom.name),
            _buildSummaryRow('Check-in', _formatDate(widget.checkInDate)),
            _buildSummaryRow('Check-out', _formatDate(widget.checkOutDate)),
            _buildSummaryRow('Guests', widget.numberOfGuests.toString()),
            _buildSummaryRow('Nights', numberOfNights.toString()),
            const Divider(),
            _buildSummaryRow('Room Rate', '₹${roomRate.toStringAsFixed(0)}/night'),
            _buildSummaryRow('Total', '₹${totalAmount.toStringAsFixed(0)}', isTotal: true),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppTheme.textSecondary,
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: isTotal ? AppTheme.hotelPrimary : AppTheme.textPrimary,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGuestDetailsForm(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Guest Details',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      labelText: 'Full Name',
                      prefixIcon: const Icon(Icons.person),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'Email Address',
                      prefixIcon: const Icon(Icons.email),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: InputDecoration(
                      labelText: 'Phone Number',
                      prefixIcon: const Icon(Icons.phone),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your phone number';
                      }
                      if (value.length < 10) {
                        return 'Please enter a valid phone number';
                      }
                      return null;
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecialRequests(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Special Requests (Optional)',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _specialRequestsController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Any special requests or notes',
                hintText: 'e.g., Early check-in, late checkout, dietary requirements...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingButton(BuildContext context) {
    return CustomButton(
      text: 'Confirm Booking',
      onPressed: _confirmBooking,
      type: ButtonType.primary,
      size: ButtonSize.large,
      width: double.infinity,
      icon: Icons.check,
    );
  }

  Future<void> _confirmBooking() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final bookingProvider = context.read<BookingProvider>();
      
      final booking = await bookingProvider.createBooking(
        propertyId: widget.property.id,
        rooms: [
          BookingRoomData(
            roomId: widget.selectedRoom.id,
            quantity: 1,
            rate: widget.selectedRoom.dailyRate,
          ),
        ],
        checkInDate: widget.checkInDate,
        checkOutDate: widget.checkOutDate,
        numberOfGuests: widget.numberOfGuests,
        specialRequests: _specialRequestsController.text.trim().isNotEmpty
            ? _specialRequestsController.text.trim()
            : null,
      );

      if (booking != null && mounted) {
        // Navigate to booking confirmation
        Navigator.pushReplacementNamed(
          context,
          '/booking-confirmation',
          arguments: booking,
        );
      } else {
        setState(() {
          _error = 'Failed to create booking';
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
