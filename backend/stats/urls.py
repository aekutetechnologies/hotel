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
]
