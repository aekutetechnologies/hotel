import 'package:flutter/material.dart';
import 'package:hsquare/models/property.dart';
import 'package:hsquare/models/booking.dart';
import 'package:hsquare/services/booking_service.dart';
import 'package:hsquare/utils/constants.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:hsquare/providers/auth_provider.dart';
import 'package:hsquare/screens/login_screen.dart';

class CreateBookingScreen extends StatefulWidget {
  final Property property;
  final String? checkInDate;
  final String? checkOutDate;
  final String? bookingType;
  final int? rooms;
  final int? guests;

  const CreateBookingScreen({
    super.key,
    required this.property,
    this.checkInDate,
    this.checkOutDate,
    this.bookingType,
    this.rooms,
    this.guests,
  });

  @override
  State<CreateBookingScreen> createState() => _CreateBookingScreenState();
}

class _CreateBookingScreenState extends State<CreateBookingScreen> {
  final BookingService _bookingService = BookingService();
  final _formKey = GlobalKey<FormState>();
  
  DateTime? _checkInDate;
  DateTime? _checkOutDate;
  TimeOfDay? _checkInTime;
  TimeOfDay? _checkOutTime;
  String _bookingType = 'daily';
  int _numberOfRooms = 1;
  int _numberOfGuests = 1;
  String _paymentType = 'cash';
  final Map<int, int> _selectedRooms = {}; // roomId -> quantity
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.checkInDate != null) {
      _checkInDate = DateTime.parse(widget.checkInDate!);
    }
    if (widget.checkOutDate != null) {
      _checkOutDate = DateTime.parse(widget.checkOutDate!);
    }
    if (widget.bookingType != null) {
      _bookingType = widget.bookingType!;
    }
    if (widget.rooms != null) {
      _numberOfRooms = widget.rooms!;
    }
    if (widget.guests != null) {
      _numberOfGuests = widget.guests!;
    }
    
    // Select first room by default
    if (widget.property.rooms.isNotEmpty) {
      _selectedRooms[widget.property.rooms.first.id] = 1;
    }
  }

  Future<void> _selectDate(BuildContext context, bool isCheckIn) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isCheckIn 
          ? (_checkInDate ?? DateTime.now())
          : (_checkOutDate ?? (_checkInDate?.add(const Duration(days: 1)) ?? DateTime.now().add(const Duration(days: 1)))),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        if (isCheckIn) {
          _checkInDate = picked;
          if (_checkOutDate != null && _checkOutDate!.isBefore(_checkInDate!)) {
            _checkOutDate = _checkInDate!.add(const Duration(days: 1));
          }
        } else {
          if (_checkInDate != null && picked.isAfter(_checkInDate!)) {
            _checkOutDate = picked;
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Check-out date must be after check-in date')),
            );
          }
        }
      });
    }
  }

  Future<void> _selectTime(BuildContext context, bool isCheckIn) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isCheckIn 
          ? (_checkInTime ?? const TimeOfDay(hour: 14, minute: 0))
          : (_checkOutTime ?? const TimeOfDay(hour: 12, minute: 0)),
    );
    if (picked != null) {
      setState(() {
        if (isCheckIn) {
          _checkInTime = picked;
        } else {
          _checkOutTime = picked;
        }
      });
    }
  }

  double _calculatePrice() {
    if (_checkInDate == null || _checkOutDate == null) return 0.0;
    
    int days = _checkOutDate!.difference(_checkInDate!).inDays;
    if (days == 0) days = 1;
    
    double total = 0.0;
    _selectedRooms.forEach((roomId, quantity) {
      final room = widget.property.rooms.firstWhere((r) => r.id == roomId);
      double rate = 0.0;
      
      switch (_bookingType) {
        case 'hourly':
          rate = room.hourlyRate ?? room.dailyRate / 24;
          total += rate * quantity * (_checkInTime != null && _checkOutTime != null 
              ? _checkOutTime!.hour - _checkInTime!.hour 
              : 1);
          break;
        case 'monthly':
          rate = room.monthlyRate ?? room.dailyRate * 30;
          total += rate * quantity * (days / 30);
          break;
        case 'yearly':
          rate = room.yearlyRate ?? room.dailyRate * 365;
          total += rate * quantity * (days / 365);
          break;
        default: // daily
          rate = room.dailyRate;
          total += rate * quantity * days;
      }
      
      if (room.discount != null && room.discount! > 0) {
        total -= (total * room.discount! / 100);
      }
    });
    
    // Add 5% GST
    total = total * 1.05;
    return total;
  }

  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_checkInDate == null || _checkOutDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select check-in and check-out dates')),
      );
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      final result = await Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
      if (result != true) return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final firstRoomId = _selectedRooms.keys.first;
      final request = BookingRequest(
        propertyId: widget.property.id,
        roomId: firstRoomId,
        checkInDate: DateFormat('yyyy-MM-dd').format(_checkInDate!),
        checkOutDate: DateFormat('yyyy-MM-dd').format(_checkOutDate!),
        checkInTime: _checkInTime != null 
            ? '${_checkInTime!.hour.toString().padLeft(2, '0')}:${_checkInTime!.minute.toString().padLeft(2, '0')}'
            : null,
        checkOutTime: _checkOutTime != null
            ? '${_checkOutTime!.hour.toString().padLeft(2, '0')}:${_checkOutTime!.minute.toString().padLeft(2, '0')}'
            : null,
        numberOfGuests: _numberOfGuests,
        numberOfRooms: _numberOfRooms,
        bookingType: _bookingType,
        paymentType: _paymentType,
        price: _calculatePrice(),
        discount: 0.0,
        bookingRoomTypes: _selectedRooms.map((key, value) => MapEntry(key.toString(), value)),
      );

      final booking = await _bookingService.createBooking(request);
      
      if (mounted) {
        Navigator.pop(context, booking);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Booking created successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create booking: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalPrice = _calculatePrice();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Booking'),
        backgroundColor: AppColors.primaryRed,
        foregroundColor: Colors.white,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Property Info
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.property.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.property.location,
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Booking Type
              const Text(
                'Booking Type',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'daily', label: Text('Daily')),
                  ButtonSegment(value: 'hourly', label: Text('Hourly')),
                ],
                selected: {_bookingType},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _bookingType = newSelection.first;
                  });
                },
              ),
              const SizedBox(height: 24),
              
              // Dates
              Row(
                children: [
                  Expanded(
                    child: _DateField(
                      label: 'Check-in',
                      date: _checkInDate,
                      onTap: () => _selectDate(context, true),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _DateField(
                      label: 'Check-out',
                      date: _checkOutDate,
                      onTap: () => _selectDate(context, false),
                    ),
                  ),
                ],
              ),
              if (_bookingType == 'hourly') ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _TimeField(
                        label: 'Check-in Time',
                        time: _checkInTime,
                        onTap: () => _selectTime(context, true),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _TimeField(
                        label: 'Check-out Time',
                        time: _checkOutTime,
                        onTap: () => _selectTime(context, false),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 24),
              
              // Rooms Selection
              const Text(
                'Select Rooms',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              ...widget.property.rooms.map((room) {
                final quantity = _selectedRooms[room.id] ?? 0;
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(room.name),
                    subtitle: Text('₹${room.dailyRate.toStringAsFixed(2)}/night'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: quantity > 0
                              ? () {
                                  setState(() {
                                    if (quantity > 1) {
                                      _selectedRooms[room.id] = quantity - 1;
                                    } else {
                                      _selectedRooms.remove(room.id);
                                    }
                                    _numberOfRooms = _selectedRooms.values.fold(0, (a, b) => a + b);
                                  });
                                }
                              : null,
                        ),
                        Text('$quantity'),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () {
                            setState(() {
                              _selectedRooms[room.id] = (quantity + 1);
                              _numberOfRooms = _selectedRooms.values.fold(0, (a, b) => a + b);
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 24),
              
              // Guests
              TextFormField(
                initialValue: _numberOfGuests.toString(),
                decoration: const InputDecoration(
                  labelText: 'Number of Guests',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  setState(() {
                    _numberOfGuests = int.tryParse(value) ?? 1;
                  });
                },
              ),
              const SizedBox(height: 24),
              
              // Payment Type
              const Text(
                'Payment Type',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'cash', label: Text('Cash')),
                  ButtonSegment(value: 'online', label: Text('Online')),
                ],
                selected: {_paymentType},
                onSelectionChanged: (Set<String> newSelection) {
                  setState(() {
                    _paymentType = newSelection.first;
                  });
                },
              ),
              const SizedBox(height: 32),
              
              // Total Price
              Card(
                color: AppColors.primaryRed.withOpacity(0.1),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Amount',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '₹${totalPrice.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryRed,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitBooking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryRed,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          'Confirm Booking',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DateField extends StatelessWidget {
  final String label;
  final DateTime? date;
  final VoidCallback onTap;

  const _DateField({
    required this.label,
    required this.date,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          suffixIcon: const Icon(Icons.calendar_today),
        ),
        child: Text(
          date != null ? DateFormat('MMM dd, yyyy').format(date!) : 'Select date',
        ),
      ),
    );
  }
}

class _TimeField extends StatelessWidget {
  final String label;
  final TimeOfDay? time;
  final VoidCallback onTap;

  const _TimeField({
    required this.label,
    required this.time,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          suffixIcon: const Icon(Icons.access_time),
        ),
        child: Text(
          time != null ? time!.format(context) : 'Select time',
        ),
      ),
    );
  }
}

