from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from property.models import Property, UserProperty
from booking.models import Booking
from expenses.models import Expense
from users.models import HsUser
from property.decorators import custom_authentication_and_permissions
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
import pandas as pd
from django.http import HttpResponse
from io import BytesIO
import xlsxwriter
from users.models import UserHsPermission


@api_view(["GET"])
@custom_authentication_and_permissions()
def get_dashboard_stats(request):
    """
    Get dashboard statistics based on user role.
    Admin users get stats for all properties, non-admin users get stats for their properties.
    """
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        # Filter properties based on user role
        if is_admin:
            properties = Property.objects.filter(is_active=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            properties = Property.objects.filter(id__in=user_property_ids, is_active=True)
        
        # Count hotels and hostels
        total_hotels = properties.filter(property_type='hotel').count()
        total_hostels = properties.filter(property_type='hostel').count()
        
        # Calculate occupancy percentage
        property_ids = properties.values_list('id', flat=True)
        today = timezone.now().date()
        
        # Get all active bookings for today
        active_bookings = Booking.objects.filter(
            property_id__in=property_ids,
            checkin_date__lte=today,
            checkout_date__gt=today,
            status__in=['confirmed', 'checked_in'],
            is_active=True
        )
        
        # Calculate total available rooms
        total_rooms = sum(properties.values_list('rooms__number_of_rooms', flat=True))
        occupied_rooms = active_bookings.aggregate(total=Sum('number_of_rooms'))['total'] or 0
        
        # Calculate occupancy percentage
        occupancy_percentage = 0
        if total_rooms > 0:
            occupancy_percentage = round((occupied_rooms / total_rooms) * 100, 2)
        
        # Get sales statistics
        # Today's sales
        today_sales = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date=today,
            is_active=True
        ).aggregate(
            total=Sum('price'),
            confirmed_count=Count('id', filter=Q(status='confirmed')),
            completed_count=Count('id', filter=Q(status='completed')),
            cancelled_count=Count('id', filter=Q(status='cancelled')),
            pending_count=Count('id', filter=Q(status='pending'))
        )
        
        # Current month sales
        current_month_start = today.replace(day=1)
        current_month_sales = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=current_month_start,
            created_at__date__lte=today,
            is_active=True
        ).aggregate(
            total=Sum('price'),
            confirmed_count=Count('id', filter=Q(status='confirmed')),
            completed_count=Count('id', filter=Q(status='completed')),
            cancelled_count=Count('id', filter=Q(status='cancelled')),
            pending_count=Count('id', filter=Q(status='pending'))
        )
        
        # Get expense statistics
        # Today's expenses
        today_expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date=today,
            is_active=True
        ).aggregate(total=Sum('amount'))
        
        # Current month expenses
        current_month_expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date__gte=current_month_start,
            date__lte=today,
            is_active=True
        ).aggregate(total=Sum('amount'))
        
        # User statistics
        total_users = HsUser.objects.filter(is_active=True).count()
        
        # New users added today
        new_users_today = HsUser.objects.filter(
            created_at__date=today,
            is_active=True
        ).count()
        
        # New users added this month
        new_users_month = HsUser.objects.filter(
            created_at__date__gte=current_month_start,
            created_at__date__lte=today,
            is_active=True
        ).count()
        
        return Response({
            'total_hotels': total_hotels,
            'total_hostels': total_hostels,
            'occupancy_percentage': occupancy_percentage,
            'sales': {
                'today': {
                    'total': today_sales['total'] or 0,
                    'confirmed': today_sales['confirmed_count'] or 0,
                    'completed': today_sales['completed_count'] or 0,
                    'cancelled': today_sales['cancelled_count'] or 0,
                    'pending': today_sales['pending_count'] or 0
                },
                'month': {
                    'total': current_month_sales['total'] or 0,
                    'confirmed': current_month_sales['confirmed_count'] or 0,
                    'completed': current_month_sales['completed_count'] or 0,
                    'cancelled': current_month_sales['cancelled_count'] or 0,
                    'pending': current_month_sales['pending_count'] or 0
                }
            },
            'expenses': {
                'today': today_expenses['total'] or 0,
                'month': current_month_expenses['total'] or 0
            },
            'users': {
                'total': total_users,
                'new_today': new_users_today,
                'new_month': new_users_month
            }
        })
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def get_property_occupancy_stats(request):
    """
    Get occupancy rate for each property the user has access to.
    """
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        # Filter properties based on user role
        if is_admin:
            properties = Property.objects.filter(is_active=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            properties = Property.objects.filter(id__in=user_property_ids, is_active=True)
        
        today = timezone.now().date()
        
        # Calculate occupancy for each property
        property_stats = []
        for prop in properties:
            # Total rooms in this property
            total_rooms = sum(prop.rooms.values_list('number_of_rooms', flat=True))
            
            # Get active bookings for today
            active_bookings = Booking.objects.filter(
                property=prop,
                checkin_date__lte=today,
                checkout_date__gt=today,
                status__in=['confirmed', 'checked_in'],
                is_active=True
            )
            
            occupied_rooms = active_bookings.aggregate(total=Sum('number_of_rooms'))['total'] or 0
            
            # Calculate occupancy percentage
            occupancy_percentage = 0
            if total_rooms > 0:
                occupancy_percentage = round((occupied_rooms / total_rooms) * 100, 2)
            
            property_stats.append({
                'property_id': prop.id,
                'property_name': prop.name,
                'property_type': prop.property_type,
                'total_rooms': total_rooms,
                'occupied_rooms': occupied_rooms,
                'occupancy_percentage': occupancy_percentage
            })
        
        return Response(property_stats)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def get_sales_stats(request):
    """
    Get detailed sales statistics with date filters.
    """
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        # Get query parameters
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str:
            # Default to first day of current month
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            # Default to today
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
        
        # Get daily sales
        daily_sales = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total=Sum('price'),
            confirmed_count=Count('id', filter=Q(status='confirmed')),
            completed_count=Count('id', filter=Q(status='completed')),
            cancelled_count=Count('id', filter=Q(status='cancelled')),
            pending_count=Count('id', filter=Q(status='pending'))
        ).order_by('date')
        
        # Get monthly sales
        monthly_sales = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total=Sum('price'),
            confirmed_count=Count('id', filter=Q(status='confirmed')),
            completed_count=Count('id', filter=Q(status='completed')),
            cancelled_count=Count('id', filter=Q(status='cancelled')),
            pending_count=Count('id', filter=Q(status='pending'))
        ).order_by('month')
        
        return Response({
            'daily': [
                {
                    'date': item['date'].strftime('%Y-%m-%d'),
                    'total': item['total'] or 0,
                    'confirmed': item['confirmed_count'] or 0,
                    'completed': item['completed_count'] or 0,
                    'cancelled': item['cancelled_count'] or 0,
                    'pending': item['pending_count'] or 0
                } for item in daily_sales
            ],
            'monthly': [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'total': item['total'] or 0,
                    'confirmed': item['confirmed_count'] or 0,
                    'completed': item['completed_count'] or 0,
                    'cancelled': item['cancelled_count'] or 0,
                    'pending': item['pending_count'] or 0
                } for item in monthly_sales
            ]
        })
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def get_expense_stats(request):
    """
    Get detailed expense statistics with date filters.
    """
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        # Get query parameters
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str:
            # Default to first day of current month
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            # Default to today
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
        
        # Get daily expenses
        daily_expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date__gte=start_date,
            date__lte=end_date,
            is_active=True
        ).values('date').annotate(
            total=Sum('amount')
        ).order_by('date')
        
        # Get monthly expenses (aggregate by month)
        monthly_expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date__gte=start_date,
            date__lte=end_date,
            is_active=True
        ).annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            total=Sum('amount')
        ).order_by('month')
        
        # Get expenses by category
        category_expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date__gte=start_date,
            date__lte=end_date,
            is_active=True
        ).values('category__name').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        return Response({
            'daily': [
                {
                    'date': item['date'].strftime('%Y-%m-%d'),
                    'total': item['total'] or 0
                } for item in daily_expenses
            ],
            'monthly': [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'total': item['total'] or 0
                } for item in monthly_expenses
            ],
            'by_category': [
                {
                    'category': item['category__name'] or 'Uncategorized',
                    'total': item['total'] or 0
                } for item in category_expenses
            ]
        })
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def get_user_stats(request):
    """
    Get detailed user statistics with date filters.
    Admin-only endpoint.
    """
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        if not is_admin:
            return Response(
                {"error": "Only admin users can access user statistics"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get query parameters
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str:
            # Default to first day of current month
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            # Default to today
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        # Get total users by role
        user_counts_by_role = HsUser.objects.filter(
            is_active=True
        ).values('user_role').annotate(
            count=Count('id')
        )
        
        # Get daily new users
        daily_new_users = HsUser.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # Get monthly new users
        monthly_new_users = HsUser.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        return Response({
            'total_by_role': {
                item['user_role']: item['count'] for item in user_counts_by_role
            },
            'daily_new_users': [
                {
                    'date': item['date'].strftime('%Y-%m-%d'),
                    'count': item['count']
                } for item in daily_new_users
            ],
            'monthly_new_users': [
                {
                    'month': item['month'].strftime('%Y-%m'),
                    'count': item['count']
                } for item in monthly_new_users
            ]
        })
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_sales_report_excel(request):
    """
    Export sales report to Excel.
    """
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        # Get query parameters
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str:
            # Default to first day of current month
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            # Default to today
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
        
        # Fetch booking data for the report
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user').order_by('created_at')
        
        # Create a BytesIO object
        output = BytesIO()
        
        # Create a Pandas DataFrame from the bookings queryset
        data = []
        for booking in bookings:
            data.append({
                'Booking ID': booking.id,
                'Date': booking.created_at.strftime('%Y-%m-%d'),
                'Customer': booking.user.name or booking.user.mobile,
                'Property': booking.property.name,
                'Property Type': booking.property.property_type,
                'Checkin Date': booking.checkin_date,
                'Checkout Date': booking.checkout_date,
                'Status': booking.status,
                'Amount': float(booking.price),
                'Discount': float(booking.discount or 0),
                'Net Amount': float(booking.price) - float(booking.discount or 0),
                'Booking Type': booking.booking_type,
                'Guests': booking.number_of_guests,
                'Rooms': booking.number_of_rooms
            })
        
        if not data:
            # Return a message if no data found
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        # Create Excel file with multiple worksheets
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed bookings
            df.to_excel(writer, sheet_name='Detailed Bookings', index=False)
            
            # Daily summary
            daily_df = df.groupby('Date').agg({
                'Amount': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            daily_df.columns = ['Date', 'Total Amount', 'Number of Bookings']
            daily_df.to_excel(writer, sheet_name='Daily Summary', index=False)
            
            # Status summary
            status_df = df.groupby('Status').agg({
                'Amount': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            status_df.columns = ['Status', 'Total Amount', 'Number of Bookings']
            status_df.to_excel(writer, sheet_name='Booking Status', index=False)
            
            # Property summary
            property_df = df.groupby(['Property', 'Property Type']).agg({
                'Amount': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            property_df.columns = ['Property', 'Property Type', 'Total Amount', 'Number of Bookings']
            property_df.to_excel(writer, sheet_name='Property Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            
            # Add formatting
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            # Apply formatting to each worksheet
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)  # Set column width
        
        # Set up the HttpResponse
        output.seek(0)
        filename = f"Sales_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_expense_report_excel(request):
    """
    Export expense report to Excel.
    """
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        # Get query parameters
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str:
            # Default to first day of current month
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            # Default to today
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
        
        # Fetch expense data for the report
        expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date__gte=start_date,
            date__lte=end_date,
            is_active=True
        ).select_related('property', 'category').order_by('date')
        
        # Create a BytesIO object
        output = BytesIO()
        
        # Create a Pandas DataFrame from the expenses queryset
        data = []
        for expense in expenses:
            data.append({
                'Expense ID': expense.id,
                'Date': expense.date,
                'Property': expense.property.name if expense.property else 'N/A',
                'Category': expense.category.name if expense.category else 'Uncategorized',
                'Description': expense.description or 'N/A',
                'Amount': float(expense.amount),
                'Created By': expense.user.name or expense.user.mobile if expense.user else 'N/A'
            })
        
        if not data:
            # Return a message if no data found
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        # Create Excel file with multiple worksheets
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed expenses
            df.to_excel(writer, sheet_name='Detailed Expenses', index=False)
            
            # Daily summary
            daily_df = df.groupby('Date').agg({
                'Amount': 'sum',
                'Expense ID': 'count'
            }).reset_index()
            daily_df.columns = ['Date', 'Total Amount', 'Number of Expenses']
            daily_df.to_excel(writer, sheet_name='Daily Summary', index=False)
            
            # Category summary
            category_df = df.groupby('Category').agg({
                'Amount': 'sum',
                'Expense ID': 'count'
            }).reset_index()
            category_df.columns = ['Category', 'Total Amount', 'Number of Expenses']
            category_df.to_excel(writer, sheet_name='Category Summary', index=False)
            
            # Property summary
            property_df = df.groupby('Property').agg({
                'Amount': 'sum',
                'Expense ID': 'count'
            }).reset_index()
            property_df.columns = ['Property', 'Total Amount', 'Number of Expenses']
            property_df.to_excel(writer, sheet_name='Property Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            
            # Add formatting
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            # Apply formatting to each worksheet
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                for col_num, value in enumerate(df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)  # Set column width
        
        # Set up the HttpResponse
        output.seek(0)
        filename = f"Expense_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
