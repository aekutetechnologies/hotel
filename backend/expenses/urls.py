from django.urls import path
from . import views

urlpatterns = [
    path('expense/', views.expense, name='expense'),
    path('expense/<int:expense_id>/', views.expense_detail, name='expense_detail'),
    path('expense-category/', views.expense_category, name='expense_category'),
    path('expense-document/', views.expense_document, name='expense_document'),
]