from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging
from property.models import Property, UserProperty
from booking.models import Booking
from expenses.models import Expense
from users.models import HsUser
from property.decorators import custom_authentication_and_permissions
from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta, datetime
import pandas as pd
from django.http import HttpResponse
from io import BytesIO
import xlsxwriter
from users.models import UserHsPermission

logger = logging.getLogger("stats")


@api_view(["GET"])
@custom_authentication_and_permissions()
def get_dashboard_stats(request):
    """
    Get dashboard statistics based on user role.
    Admin users get stats for all properties, non-admin users get stats for their properties.
    """
    logger.info("get_dashboard_stats called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
        logger.info(f"Dashboard stats retrieved successfully for user {user.id}", extra={"request_method": request.method, "user_id": user.id, "is_admin": is_admin})
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
        logger.exception(f"Error in get_dashboard_stats: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
    logger.info("get_property_occupancy_stats called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
        
        logger.info(f"Retrieved occupancy stats for {len(property_stats)} properties", extra={"request_method": request.method, "user_id": user.id, "count": len(property_stats)})
        return Response(property_stats)
    except Exception as e:
        logger.exception(f"Error in get_property_occupancy_stats: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    logger.info(f"get_sales_stats called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
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
        
        logger.info(f"Sales stats retrieved successfully", extra={"request_method": request.method, "user_id": user.id, "daily_count": len(daily_sales), "monthly_count": len(monthly_sales)})
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
        logger.exception(f"Error in get_sales_stats: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    logger.info(f"get_expense_stats called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
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
        
        logger.info(f"Expense stats retrieved successfully", extra={"request_method": request.method, "user_id": user.id, "daily_count": len(daily_expenses), "monthly_count": len(monthly_expenses), "category_count": len(category_expenses)})
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
        logger.exception(f"Error in get_expense_stats: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    logger.info(f"get_user_stats called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str})
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
        
        logger.info(f"User stats retrieved successfully", extra={"request_method": request.method, "user_id": user.id, "daily_count": len(daily_new_users), "monthly_count": len(monthly_new_users)})
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
        logger.exception(f"Error in get_user_stats: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    logger.info(f"export_sales_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
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
            logger.warning(f"No data found for sales report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
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
        
        logger.info(f"Sales report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "bookings_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_sales_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
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
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    logger.info(f"export_expense_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
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
            logger.warning(f"No data found for expense report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
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
        
        logger.info(f"Expense report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "expenses_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_expense_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Financial Reports

@api_view(["GET"])
@custom_authentication_and_permissions()
def export_revenue_report_excel(request):
    """
    Export revenue report to Excel with GST breakdown.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_revenue_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch booking data for the report
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user').order_by('created_at')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        data = []
        for booking in bookings:
            # Calculate taxable amount (price - discount)
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            # Get dynamic tax rate
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            net_amount = taxable_amount + tax_amount
            
            data.append({
                'Date': booking.created_at.strftime('%Y-%m-%d'),
                'Booking ID': booking.booking_id or f"#{booking.id}",
                'Property': booking.property.name if booking.property else 'N/A',
                'Property Type': booking.property.property_type if booking.property else 'N/A',
                'Customer': booking.user.name or booking.user.mobile if booking.user else 'N/A',
                'Booking Type': booking.booking_type,
                'Payment Method': booking.payment_type,
                'Amount': float(booking.price),
                'Discount': float(booking.discount or 0),
                'Taxable Amount': float(taxable_amount),
                'Tax Rate %': float(tax_rate * 100),
                'Tax Amount': float(tax_amount),
                'Net Amount': float(net_amount),
                'Status': booking.status
            })
        
        if not data:
            logger.warning(f"No data found for revenue report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed revenue
            df.to_excel(writer, sheet_name='Detailed Revenue', index=False)
            
            # Summary by property
            property_df = df.groupby(['Property', 'Property Type']).agg({
                'Net Amount': 'sum',
                'Amount': 'sum',
                'Tax Amount': 'sum',
                'Discount': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            property_df.columns = ['Property', 'Property Type', 'Total Revenue', 'Gross Amount', 'Total Tax', 'Total Discount', 'Number of Bookings']
            property_df.to_excel(writer, sheet_name='Property Summary', index=False)
            
            # Summary by booking type
            booking_type_df = df.groupby('Booking Type').agg({
                'Net Amount': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            booking_type_df.columns = ['Booking Type', 'Total Revenue', 'Number of Bookings']
            booking_type_df.to_excel(writer, sheet_name='Booking Type Summary', index=False)
            
            # Summary by payment method
            payment_df = df.groupby('Payment Method').agg({
                'Net Amount': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            payment_df.columns = ['Payment Method', 'Total Revenue', 'Number of Bookings']
            payment_df.to_excel(writer, sheet_name='Payment Method Summary', index=False)
            
            # Daily summary
            daily_df = df.groupby('Date').agg({
                'Net Amount': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            daily_df.columns = ['Date', 'Total Revenue', 'Number of Bookings']
            daily_df.to_excel(writer, sheet_name='Daily Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                for col_num, value in enumerate(df.columns.values if sheet_name == 'Detailed Revenue' else property_df.columns.values if sheet_name == 'Property Summary' else booking_type_df.columns.values if sheet_name == 'Booking Type Summary' else payment_df.columns.values if sheet_name == 'Payment Method Summary' else daily_df.columns.values):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Revenue_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"Revenue report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "bookings_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_revenue_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_profit_loss_report_excel(request):
    """
    Export Profit & Loss report to Excel.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_profit_loss_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Get revenue data
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user')
        
        # Get expense data
        expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date__gte=start_date,
            date__lte=end_date,
            is_active=True
        ).select_related('property', 'category')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        # Calculate revenue by property
        revenue_data = []
        for booking in bookings:
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            net_revenue = taxable_amount + tax_amount
            
            revenue_data.append({
                'property_id': booking.property.id if booking.property else None,
                'property_name': booking.property.name if booking.property else 'N/A',
                'revenue': float(net_revenue)
            })
        
        # Calculate expenses by property
        expense_data = []
        for expense in expenses:
            expense_data.append({
                'property_id': expense.property.id if expense.property else None,
                'property_name': expense.property.name if expense.property else 'N/A',
                'expense': float(expense.amount)
            })
        
        # Aggregate by property
        revenue_df = pd.DataFrame(revenue_data)
        expense_df = pd.DataFrame(expense_data)
        
        if revenue_df.empty and expense_df.empty:
            logger.warning(f"No data found for P&L report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Group by property
        revenue_summary = revenue_df.groupby(['property_id', 'property_name'])['revenue'].sum().reset_index() if not revenue_df.empty else pd.DataFrame(columns=['property_id', 'property_name', 'revenue'])
        expense_summary = expense_df.groupby(['property_id', 'property_name'])['expense'].sum().reset_index() if not expense_df.empty else pd.DataFrame(columns=['property_id', 'property_name', 'expense'])
        
        # Merge revenue and expenses
        if not revenue_summary.empty and not expense_summary.empty:
            pl_df = pd.merge(revenue_summary, expense_summary, on=['property_id', 'property_name'], how='outer').fillna(0)
        elif not revenue_summary.empty:
            pl_df = revenue_summary.copy()
            pl_df['expense'] = 0
        elif not expense_summary.empty:
            pl_df = expense_summary.copy()
            pl_df['revenue'] = 0
        else:
            pl_df = pd.DataFrame(columns=['property_id', 'property_name', 'revenue', 'expense'])
        
        pl_df['net_profit'] = pl_df['revenue'] - pl_df['expense']
        pl_df['profit_margin_pct'] = (pl_df['net_profit'] / pl_df['revenue'] * 100).round(2)
        pl_df['profit_margin_pct'] = pl_df['profit_margin_pct'].fillna(0)
        pl_df = pl_df[['property_name', 'revenue', 'expense', 'net_profit', 'profit_margin_pct']]
        pl_df.columns = ['Property', 'Total Revenue', 'Total Expenses', 'Net Profit', 'Profit Margin %']
        
        # Overall summary
        total_revenue = pl_df['Total Revenue'].sum()
        total_expenses = pl_df['Total Expenses'].sum()
        total_profit = total_revenue - total_expenses
        overall_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        summary_data = [{
            'Property': 'ALL PROPERTIES',
            'Total Revenue': total_revenue,
            'Total Expenses': total_expenses,
            'Net Profit': total_profit,
            'Profit Margin %': round(overall_margin, 2)
        }]
        summary_df = pd.DataFrame(summary_data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Overall summary
            summary_df.to_excel(writer, sheet_name='Overall Summary', index=False)
            
            # Property-wise P&L
            pl_df.to_excel(writer, sheet_name='Property-wise P&L', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                cols = summary_df.columns.values if sheet_name == 'Overall Summary' else pl_df.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Profit_Loss_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"P&L report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename})
        return response
    except Exception as e:
        logger.exception(f"Error in export_profit_loss_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_gst_report_excel(request):
    """
    Export GST report to Excel with tax breakdown.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_gst_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch booking data
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user').order_by('created_at')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        data = []
        for booking in bookings:
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            tax_rate_pct = float(tax_rate * 100)
            
            data.append({
                'Date': booking.created_at.strftime('%Y-%m-%d'),
                'Booking ID': booking.booking_id or f"#{booking.id}",
                'Property': booking.property.name if booking.property else 'N/A',
                'Customer': booking.user.name or booking.user.mobile if booking.user else 'N/A',
                'Taxable Amount': float(taxable_amount),
                'Tax Rate %': tax_rate_pct,
                'GST Amount': float(tax_amount),
                'Total Amount (Incl. GST)': float(taxable_amount + tax_amount)
            })
        
        if not data:
            logger.warning(f"No data found for GST report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed GST
            df.to_excel(writer, sheet_name='Detailed GST', index=False)
            
            # Summary by tax rate
            tax_rate_df = df.groupby('Tax Rate %').agg({
                'Taxable Amount': 'sum',
                'GST Amount': 'sum',
                'Total Amount (Incl. GST)': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            tax_rate_df.columns = ['Tax Rate %', 'Total Taxable Amount', 'Total GST', 'Total Amount (Incl. GST)', 'Number of Bookings']
            tax_rate_df.to_excel(writer, sheet_name='Tax Rate Summary', index=False)
            
            # Summary by property
            property_df = df.groupby('Property').agg({
                'Taxable Amount': 'sum',
                'GST Amount': 'sum',
                'Total Amount (Incl. GST)': 'sum',
                'Booking ID': 'count'
            }).reset_index()
            property_df.columns = ['Property', 'Total Taxable Amount', 'Total GST', 'Total Amount (Incl. GST)', 'Number of Bookings']
            property_df.to_excel(writer, sheet_name='Property Summary', index=False)
            
            # Daily summary
            daily_df = df.groupby('Date').agg({
                'Taxable Amount': 'sum',
                'GST Amount': 'sum',
                'Total Amount (Incl. GST)': 'sum'
            }).reset_index()
            daily_df.columns = ['Date', 'Total Taxable Amount', 'Total GST', 'Total Amount (Incl. GST)']
            daily_df.to_excel(writer, sheet_name='Daily Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                cols = df.columns.values if sheet_name == 'Detailed GST' else tax_rate_df.columns.values if sheet_name == 'Tax Rate Summary' else property_df.columns.values if sheet_name == 'Property Summary' else daily_df.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"GST_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"GST report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "bookings_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_gst_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Operational Reports

@api_view(["GET"])
@custom_authentication_and_permissions()
def export_booking_summary_report_excel(request):
    """
    Export booking summary report to Excel with status breakdown.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_booking_summary_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch booking data
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        # Detailed bookings
        data = []
        for booking in bookings:
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            net_revenue = taxable_amount + tax_amount
            
            data.append({
                'Booking ID': booking.booking_id or f"#{booking.id}",
                'Date': booking.created_at.strftime('%Y-%m-%d'),
                'Property': booking.property.name if booking.property else 'N/A',
                'Property Type': booking.property.property_type if booking.property else 'N/A',
                'Customer': booking.user.name or booking.user.mobile if booking.user else 'N/A',
                'Check-in Date': booking.checkin_date.strftime('%Y-%m-%d') if booking.checkin_date else 'N/A',
                'Check-out Date': booking.checkout_date.strftime('%Y-%m-%d') if booking.checkout_date else 'N/A',
                'Status': booking.status,
                'Booking Type': booking.booking_type,
                'Booking Time': booking.booking_time,
                'Number of Rooms': booking.number_of_rooms,
                'Number of Guests': booking.number_of_guests,
                'Revenue': float(net_revenue)
            })
        
        if not data:
            logger.warning(f"No data found for booking summary report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed bookings
            df.to_excel(writer, sheet_name='Detailed Bookings', index=False)
            
            # Summary by property
            property_summary = df.groupby(['Property', 'Property Type']).agg({
                'Booking ID': 'count',
                'Revenue': 'sum'
            }).reset_index()
            property_summary.columns = ['Property', 'Property Type', 'Total Bookings', 'Total Revenue']
            
            # Add status breakdown by property
            status_by_property = df.groupby(['Property', 'Status']).agg({
                'Booking ID': 'count',
                'Revenue': 'sum'
            }).reset_index()
            status_by_property.columns = ['Property', 'Status', 'Count', 'Revenue']
            status_pivot = status_by_property.pivot_table(
                index='Property',
                columns='Status',
                values='Count',
                fill_value=0
            ).reset_index()
            
            property_summary.to_excel(writer, sheet_name='Property Summary', index=False)
            status_pivot.to_excel(writer, sheet_name='Status by Property', index=False)
            
            # Summary by status
            status_summary = df.groupby('Status').agg({
                'Booking ID': 'count',
                'Revenue': 'sum'
            }).reset_index()
            status_summary.columns = ['Status', 'Total Bookings', 'Total Revenue']
            status_summary.to_excel(writer, sheet_name='Status Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                if sheet_name == 'Detailed Bookings':
                    cols = df.columns.values
                elif sheet_name == 'Property Summary':
                    cols = property_summary.columns.values
                elif sheet_name == 'Status by Property':
                    cols = status_pivot.columns.values
                else:
                    cols = status_summary.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Booking_Summary_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"Booking summary report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "bookings_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_booking_summary_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_occupancy_report_excel(request):
    """
    Export occupancy report to Excel.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_occupancy_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                properties = Property.objects.filter(id=int(property_id), is_active=True)
            else:
                properties = Property.objects.filter(is_active=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                properties = Property.objects.filter(id=int(property_id), id__in=user_property_ids, is_active=True) if int(property_id) in user_property_ids else Property.objects.none()
            else:
                properties = Property.objects.filter(id__in=user_property_ids, is_active=True)
        
        output = BytesIO()
        from property.models import Room
        
        # Calculate occupancy for each day in the date range
        occupancy_data = []
        current_date = start_date
        while current_date <= end_date:
            for prop in properties:
                # Get total rooms
                total_rooms = sum(room.number_of_rooms for room in prop.rooms.all()) if hasattr(prop, 'rooms') else 0
                
                # Get occupied rooms for this date
                occupied_bookings = Booking.objects.filter(
                    property=prop,
                    checkin_date__lte=current_date,
                    checkout_date__gt=current_date,
                    status__in=['confirmed', 'checked_in'],
                    is_active=True
                )
                occupied_rooms = occupied_bookings.aggregate(total=Sum('number_of_rooms'))['total'] or 0
                
                occupancy_pct = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
                
                occupancy_data.append({
                    'Date': current_date.strftime('%Y-%m-%d'),
                    'Property': prop.name,
                    'Property Type': prop.property_type,
                    'Total Rooms': total_rooms,
                    'Occupied Rooms': occupied_rooms,
                    'Available Rooms': total_rooms - occupied_rooms,
                    'Occupancy %': round(occupancy_pct, 2)
                })
            current_date += timedelta(days=1)
        
        if not occupancy_data:
            logger.warning(f"No data found for occupancy report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(occupancy_data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Daily occupancy
            df.to_excel(writer, sheet_name='Daily Occupancy', index=False)
            
            # Property summary (average occupancy)
            property_summary = df.groupby(['Property', 'Property Type']).agg({
                'Occupancy %': 'mean',
                'Total Rooms': 'first',
                'Occupied Rooms': 'mean'
            }).reset_index()
            property_summary.columns = ['Property', 'Property Type', 'Average Occupancy %', 'Total Rooms', 'Avg Occupied Rooms']
            property_summary['Average Occupancy %'] = property_summary['Average Occupancy %'].round(2)
            property_summary.to_excel(writer, sheet_name='Property Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                cols = df.columns.values if sheet_name == 'Daily Occupancy' else property_summary.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Occupancy_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"Occupancy report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename})
        return response
    except Exception as e:
        logger.exception(f"Error in export_occupancy_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_cancellation_report_excel(request):
    """
    Export cancellation report to Excel.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_cancellation_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch cancelled bookings
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            status='cancelled',
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user').order_by('-updated_at')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        data = []
        for booking in bookings:
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            total_amount = taxable_amount + tax_amount
            
            # Calculate days between booking and cancellation
            days_to_cancellation = (booking.updated_at.date() - booking.created_at.date()).days if booking.updated_at else 0
            
            data.append({
                'Booking ID': booking.booking_id or f"#{booking.id}",
                'Booking Date': booking.created_at.strftime('%Y-%m-%d'),
                'Cancellation Date': booking.updated_at.strftime('%Y-%m-%d') if booking.updated_at else 'N/A',
                'Days to Cancellation': days_to_cancellation,
                'Property': booking.property.name if booking.property else 'N/A',
                'Property Type': booking.property.property_type if booking.property else 'N/A',
                'Customer': booking.user.name or booking.user.mobile if booking.user else 'N/A',
                'Check-in Date': booking.checkin_date.strftime('%Y-%m-%d') if booking.checkin_date else 'N/A',
                'Check-out Date': booking.checkout_date.strftime('%Y-%m-%d') if booking.checkout_date else 'N/A',
                'Booking Type': booking.booking_type,
                'Amount': float(booking.price),
                'Discount': float(booking.discount or 0),
                'Tax Amount': float(tax_amount),
                'Total Amount': float(total_amount),
                'Refund Amount': float(total_amount)  # Assuming full refund for cancelled bookings
            })
        
        if not data:
            logger.warning(f"No data found for cancellation report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed cancellations
            df.to_excel(writer, sheet_name='Detailed Cancellations', index=False)
            
            # Summary by property
            property_summary = df.groupby(['Property', 'Property Type']).agg({
                'Booking ID': 'count',
                'Total Amount': 'sum',
                'Refund Amount': 'sum'
            }).reset_index()
            property_summary.columns = ['Property', 'Property Type', 'Cancellations', 'Total Amount', 'Total Refunds']
            property_summary.to_excel(writer, sheet_name='Property Summary', index=False)
            
            # Summary by booking type
            booking_type_summary = df.groupby('Booking Type').agg({
                'Booking ID': 'count',
                'Total Amount': 'sum',
                'Refund Amount': 'sum'
            }).reset_index()
            booking_type_summary.columns = ['Booking Type', 'Cancellations', 'Total Amount', 'Total Refunds']
            booking_type_summary.to_excel(writer, sheet_name='Booking Type Summary', index=False)
            
            # Daily cancellation trend
            daily_df = df.groupby('Cancellation Date').agg({
                'Booking ID': 'count',
                'Refund Amount': 'sum'
            }).reset_index()
            daily_df.columns = ['Date', 'Cancellations', 'Refund Amount']
            daily_df.to_excel(writer, sheet_name='Daily Trend', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                if sheet_name == 'Detailed Cancellations':
                    cols = df.columns.values
                elif sheet_name == 'Property Summary':
                    cols = property_summary.columns.values
                elif sheet_name == 'Booking Type Summary':
                    cols = booking_type_summary.columns.values
                else:
                    cols = daily_df.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Cancellation_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"Cancellation report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "cancellations_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_cancellation_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_no_show_report_excel(request):
    """
    Export no-show report to Excel.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_no_show_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch no-show bookings
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            status='no_show',
            checkin_date__gte=start_date,
            checkin_date__lte=end_date,
            is_active=True
        ).select_related('property', 'user').order_by('-checkin_date')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        data = []
        for booking in bookings:
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            total_amount = taxable_amount + tax_amount
            
            data.append({
                'Booking ID': booking.booking_id or f"#{booking.id}",
                'Booking Date': booking.created_at.strftime('%Y-%m-%d'),
                'Check-in Date': booking.checkin_date.strftime('%Y-%m-%d') if booking.checkin_date else 'N/A',
                'Check-out Date': booking.checkout_date.strftime('%Y-%m-%d') if booking.checkout_date else 'N/A',
                'Property': booking.property.name if booking.property else 'N/A',
                'Property Type': booking.property.property_type if booking.property else 'N/A',
                'Customer Name': booking.user.name if booking.user else 'N/A',
                'Customer Mobile': booking.user.mobile if booking.user else 'N/A',
                'Customer Email': booking.user.email if booking.user else 'N/A',
                'Booking Type': booking.booking_type,
                'Payment Method': booking.payment_type,
                'Number of Rooms': booking.number_of_rooms,
                'Number of Guests': booking.number_of_guests,
                'Amount': float(booking.price),
                'Discount': float(booking.discount or 0),
                'Total Amount': float(total_amount)
            })
        
        if not data:
            logger.warning(f"No data found for no-show report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed no-shows
            df.to_excel(writer, sheet_name='Detailed No-Shows', index=False)
            
            # Summary by property
            property_summary = df.groupby(['Property', 'Property Type']).agg({
                'Booking ID': 'count',
                'Total Amount': 'sum'
            }).reset_index()
            property_summary.columns = ['Property', 'Property Type', 'No-Shows', 'Total Amount']
            property_summary.to_excel(writer, sheet_name='Property Summary', index=False)
            
            # Summary by booking type
            booking_type_summary = df.groupby('Booking Type').agg({
                'Booking ID': 'count',
                'Total Amount': 'sum'
            }).reset_index()
            booking_type_summary.columns = ['Booking Type', 'No-Shows', 'Total Amount']
            booking_type_summary.to_excel(writer, sheet_name='Booking Type Summary', index=False)
            
            # Daily no-show trend
            daily_df = df.groupby('Check-in Date').agg({
                'Booking ID': 'count',
                'Total Amount': 'sum'
            }).reset_index()
            daily_df.columns = ['Date', 'No-Shows', 'Total Amount']
            daily_df.to_excel(writer, sheet_name='Daily Trend', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                if sheet_name == 'Detailed No-Shows':
                    cols = df.columns.values
                elif sheet_name == 'Property Summary':
                    cols = property_summary.columns.values
                elif sheet_name == 'Booking Type Summary':
                    cols = booking_type_summary.columns.values
                else:
                    cols = daily_df.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"No_Show_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"No-show report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "no_shows_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_no_show_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Customer Reports

@api_view(["GET"])
@custom_authentication_and_permissions()
def export_customer_history_report_excel(request):
    """
    Export customer booking history report to Excel.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_customer_history_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch booking data
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user').order_by('user', 'created_at')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        data = []
        for booking in bookings:
            if not booking.user:
                continue
                
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            net_revenue = taxable_amount + tax_amount
            
            data.append({
                'Customer ID': booking.user.id,
                'Customer Name': booking.user.name or 'N/A',
                'Customer Mobile': booking.user.mobile,
                'Customer Email': booking.user.email or 'N/A',
                'Booking ID': booking.booking_id or f"#{booking.id}",
                'Booking Date': booking.created_at.strftime('%Y-%m-%d'),
                'Property': booking.property.name if booking.property else 'N/A',
                'Property Type': booking.property.property_type if booking.property else 'N/A',
                'Check-in Date': booking.checkin_date.strftime('%Y-%m-%d') if booking.checkin_date else 'N/A',
                'Check-out Date': booking.checkout_date.strftime('%Y-%m-%d') if booking.checkout_date else 'N/A',
                'Status': booking.status,
                'Booking Type': booking.booking_type,
                'Payment Method': booking.payment_type,
                'Number of Rooms': booking.number_of_rooms,
                'Number of Guests': booking.number_of_guests,
                'Amount': float(booking.price),
                'Discount': float(booking.discount or 0),
                'Total Amount': float(net_revenue)
            })
        
        if not data:
            logger.warning(f"No data found for customer history report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Detailed customer history
            df.to_excel(writer, sheet_name='Customer Booking History', index=False)
            
            # Summary by customer
            customer_summary = df.groupby(['Customer ID', 'Customer Name', 'Customer Mobile', 'Customer Email']).agg({
                'Booking ID': 'count',
                'Total Amount': 'sum'
            }).reset_index()
            customer_summary.columns = ['Customer ID', 'Customer Name', 'Customer Mobile', 'Customer Email', 'Total Bookings', 'Total Spent']
            customer_summary.to_excel(writer, sheet_name='Customer Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                cols = df.columns.values if sheet_name == 'Customer Booking History' else customer_summary.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Customer_History_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"Customer history report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "bookings_count": len(data)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_customer_history_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_repeat_customer_report_excel(request):
    """
    Export repeat customer report to Excel.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_repeat_customer_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch booking data
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        # Group by customer
        customer_data = {}
        for booking in bookings:
            if not booking.user:
                continue
                
            customer_id = booking.user.id
            if customer_id not in customer_data:
                customer_data[customer_id] = {
                    'Customer ID': customer_id,
                    'Customer Name': booking.user.name or 'N/A',
                    'Customer Mobile': booking.user.mobile,
                    'Customer Email': booking.user.email or 'N/A',
                    'Total Bookings': 0,
                    'Total Amount': Decimal('0'),
                    'First Booking Date': booking.created_at.date(),
                    'Last Booking Date': booking.created_at.date(),
                    'Properties Visited': set(),
                    'Booking Types': set()
                }
            
            customer_data[customer_id]['Total Bookings'] += 1
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            net_revenue = taxable_amount + tax_amount
            customer_data[customer_id]['Total Amount'] += net_revenue
            
            if booking.created_at.date() < customer_data[customer_id]['First Booking Date']:
                customer_data[customer_id]['First Booking Date'] = booking.created_at.date()
            if booking.created_at.date() > customer_data[customer_id]['Last Booking Date']:
                customer_data[customer_id]['Last Booking Date'] = booking.created_at.date()
            
            if booking.property:
                customer_data[customer_id]['Properties Visited'].add(booking.property.name)
            customer_data[customer_id]['Booking Types'].add(booking.booking_type)
        
        # Filter only repeat customers (2+ bookings)
        repeat_customers = []
        for customer_id, data in customer_data.items():
            if data['Total Bookings'] >= 2:
                repeat_customers.append({
                    'Customer ID': data['Customer ID'],
                    'Customer Name': data['Customer Name'],
                    'Customer Mobile': data['Customer Mobile'],
                    'Customer Email': data['Customer Email'],
                    'Total Bookings': data['Total Bookings'],
                    'Total Spent': float(data['Total Amount']),
                    'Average Booking Value': float(data['Total Amount'] / data['Total Bookings']),
                    'First Booking Date': data['First Booking Date'].strftime('%Y-%m-%d'),
                    'Last Booking Date': data['Last Booking Date'].strftime('%Y-%m-%d'),
                    'Properties Visited': len(data['Properties Visited']),
                    'Booking Types': ', '.join(data['Booking Types'])
                })
        
        if not repeat_customers:
            logger.warning(f"No repeat customers found for report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No repeat customers found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(repeat_customers)
        df = df.sort_values('Total Bookings', ascending=False)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Repeat customers
            df.to_excel(writer, sheet_name='Repeat Customers', index=False)
            
            # Summary statistics
            summary_data = [{
                'Metric': 'Total Repeat Customers',
                'Value': len(repeat_customers)
            }, {
                'Metric': 'Total Bookings by Repeat Customers',
                'Value': df['Total Bookings'].sum()
            }, {
                'Metric': 'Total Revenue from Repeat Customers',
                'Value': df['Total Spent'].sum()
            }, {
                'Metric': 'Average Bookings per Repeat Customer',
                'Value': round(df['Total Bookings'].mean(), 2)
            }, {
                'Metric': 'Average Revenue per Repeat Customer',
                'Value': round(df['Total Spent'].mean(), 2)
            }]
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                cols = df.columns.values if sheet_name == 'Repeat Customers' else summary_df.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Repeat_Customer_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"Repeat customer report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename, "repeat_customers_count": len(repeat_customers)})
        return response
    except Exception as e:
        logger.exception(f"Error in export_repeat_customer_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@custom_authentication_and_permissions()
def export_customer_demographics_report_excel(request):
    """
    Export customer demographics report to Excel.
    """
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')
    property_id = request.query_params.get('property_id')
    logger.info(f"export_customer_demographics_report_excel called", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None, "start_date": start_date_str, "end_date": end_date_str, "property_id": property_id})
    try:
        user = request.user
        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        
        if not start_date_str:
            start_date = timezone.now().date().replace(day=1)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
        # Filter properties based on user role
        if is_admin:
            if property_id:
                property_ids = [int(property_id)]
            else:
                property_ids = Property.objects.filter(is_active=True).values_list('id', flat=True)
        else:
            user_property_ids = UserProperty.objects.filter(
                user=user, 
                is_active=True
            ).values_list('property_id', flat=True)
            if property_id:
                property_ids = [int(property_id)] if int(property_id) in user_property_ids else []
            else:
                property_ids = list(user_property_ids)
        
        # Fetch booking data
        bookings = Booking.objects.filter(
            property_id__in=property_ids,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            is_active=True
        ).select_related('property', 'user')
        
        output = BytesIO()
        from property.models import Setting
        from decimal import Decimal
        
        data = []
        for booking in bookings:
            if not booking.user:
                continue
                
            taxable_amount = Decimal(str(booking.price)) - Decimal(str(booking.discount or 0))
            tax_rate = Setting.get_dynamic_tax_rate(float(taxable_amount))
            tax_amount = taxable_amount * tax_rate
            net_revenue = taxable_amount + tax_amount
            
            # Extract location from mobile number (first 2 digits for state code approximation)
            mobile = booking.user.mobile or ''
            location_hint = mobile[:2] if len(mobile) >= 2 else 'Unknown'
            
            data.append({
                'Customer ID': booking.user.id,
                'Customer Name': booking.user.name or 'N/A',
                'Customer Mobile': booking.user.mobile,
                'Customer Email': booking.user.email or 'N/A',
                'Location Hint': location_hint,
                'Property Type Preference': booking.property.property_type if booking.property else 'N/A',
                'Booking Type Preference': booking.booking_type,
                'Payment Method Preference': booking.payment_type,
                'Average Guests': booking.number_of_guests,
                'Average Rooms': booking.number_of_rooms,
                'Total Bookings': 1,  # Will be aggregated
                'Total Spent': float(net_revenue)
            })
        
        if not data:
            logger.warning(f"No data found for customer demographics report export", extra={"request_method": request.method, "user_id": user.id, "start_date": start_date, "end_date": end_date})
            return Response(
                {"error": "No data found for the selected date range"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        df = pd.DataFrame(data)
        
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Customer demographics
            customer_demographics = df.groupby(['Customer ID', 'Customer Name', 'Customer Mobile', 'Customer Email', 'Location Hint']).agg({
                'Total Bookings': 'sum',
                'Total Spent': 'sum',
                'Property Type Preference': lambda x: x.mode()[0] if len(x.mode()) > 0 else 'N/A',
                'Booking Type Preference': lambda x: x.mode()[0] if len(x.mode()) > 0 else 'N/A',
                'Payment Method Preference': lambda x: x.mode()[0] if len(x.mode()) > 0 else 'N/A',
                'Average Guests': 'mean',
                'Average Rooms': 'mean'
            }).reset_index()
            customer_demographics.columns = ['Customer ID', 'Customer Name', 'Customer Mobile', 'Customer Email', 'Location', 'Total Bookings', 'Total Spent', 'Preferred Property Type', 'Preferred Booking Type', 'Preferred Payment Method', 'Avg Guests', 'Avg Rooms']
            customer_demographics['Avg Guests'] = customer_demographics['Avg Guests'].round(1)
            customer_demographics['Avg Rooms'] = customer_demographics['Avg Rooms'].round(1)
            customer_demographics.to_excel(writer, sheet_name='Customer Demographics', index=False)
            
            # Summary by property type preference
            property_type_summary = df.groupby('Property Type Preference').agg({
                'Customer ID': 'nunique',
                'Total Bookings': 'sum',
                'Total Spent': 'sum'
            }).reset_index()
            property_type_summary.columns = ['Property Type', 'Unique Customers', 'Total Bookings', 'Total Revenue']
            property_type_summary.to_excel(writer, sheet_name='Property Type Preference', index=False)
            
            # Summary by booking type preference
            booking_type_summary = df.groupby('Booking Type Preference').agg({
                'Customer ID': 'nunique',
                'Total Bookings': 'sum',
                'Total Spent': 'sum'
            }).reset_index()
            booking_type_summary.columns = ['Booking Type', 'Unique Customers', 'Total Bookings', 'Total Revenue']
            booking_type_summary.to_excel(writer, sheet_name='Booking Type Preference', index=False)
            
            # Summary by payment method preference
            payment_summary = df.groupby('Payment Method Preference').agg({
                'Customer ID': 'nunique',
                'Total Bookings': 'sum',
                'Total Spent': 'sum'
            }).reset_index()
            payment_summary.columns = ['Payment Method', 'Unique Customers', 'Total Bookings', 'Total Revenue']
            payment_summary.to_excel(writer, sheet_name='Payment Method Preference', index=False)
            
            # Format the workbook
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#D7E4BC',
                'border': 1
            })
            
            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                if sheet_name == 'Customer Demographics':
                    cols = customer_demographics.columns.values
                elif sheet_name == 'Property Type Preference':
                    cols = property_type_summary.columns.values
                elif sheet_name == 'Booking Type Preference':
                    cols = booking_type_summary.columns.values
                else:
                    cols = payment_summary.columns.values
                for col_num, value in enumerate(cols):
                    worksheet.write(0, col_num, value, header_format)
                worksheet.set_column('A:Z', 15)
        
        output.seek(0)
        filename = f"Customer_Demographics_Report_{start_date}_to_{end_date}.xlsx"
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        logger.info(f"Customer demographics report Excel exported successfully: {filename}", extra={"request_method": request.method, "user_id": user.id, "filename": filename})
        return response
    except Exception as e:
        logger.exception(f"Error in export_customer_demographics_report_excel: {str(e)}", extra={"request_method": request.method, "user_id": request.user.id if hasattr(request.user, 'id') else None})
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
