from django.urls import path
from . import views

urlpatterns = [
    # Dashboard statistics
    path('dashboard/', views.get_dashboard_stats, name='dashboard-stats'),
    
    # Property occupancy statistics
    path('property-occupancy/', views.get_property_occupancy_stats, name='property-occupancy-stats'),
    
    # Sales statistics
    path('sales/', views.get_sales_stats, name='sales-stats'),
    
    # Expense statistics
    path('expenses/', views.get_expense_stats, name='expense-stats'),
    
    # User statistics (admin only)
    path('users/', views.get_user_stats, name='user-stats'),
    
    # Excel reports
    path('reports/sales/excel/', views.export_sales_report_excel, name='export-sales-report'),
    path('reports/expenses/excel/', views.export_expense_report_excel, name='export-expense-report'),
    
    # Financial Reports
    path('reports/revenue/excel/', views.export_revenue_report_excel, name='export-revenue-report'),
    path('reports/profit-loss/excel/', views.export_profit_loss_report_excel, name='export-profit-loss-report'),
    path('reports/gst/excel/', views.export_gst_report_excel, name='export-gst-report'),
    
    # Operational Reports
    path('reports/booking-summary/excel/', views.export_booking_summary_report_excel, name='export-booking-summary-report'),
    path('reports/occupancy/excel/', views.export_occupancy_report_excel, name='export-occupancy-report'),
    path('reports/cancellation/excel/', views.export_cancellation_report_excel, name='export-cancellation-report'),
    path('reports/no-show/excel/', views.export_no_show_report_excel, name='export-no-show-report'),
    
    # Customer Reports
    path('reports/customer-history/excel/', views.export_customer_history_report_excel, name='export-customer-history-report'),
    path('reports/repeat-customer/excel/', views.export_repeat_customer_report_excel, name='export-repeat-customer-report'),
    path('reports/customer-demographics/excel/', views.export_customer_demographics_report_excel, name='export-customer-demographics-report'),
]
