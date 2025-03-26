from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import ExpenseSerializer, ExpenseCategorySerializer, ExpenseDocumentSerializer, ExpenseDocumentViewSerializer, ExpenseViewSerializer
from .models import Expense, ExpenseCategory, ExpenseDocument
from django.conf import settings
from users.decorators import custom_authentication_and_permissions
from django.shortcuts import get_object_or_404
from property.models import Property


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def expense(request):
    if request.method == 'GET':
        expenses = Expense.objects.filter(user=request.user)
        serializer = ExpenseViewSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            property_id = request.data.get('property')
            category_id = request.data.get('category')
            try:
                # Assuming property_id and category_id are passed in the request data
                property_instance = get_object_or_404(Property, id=property_id)
                category_instance = get_object_or_404(ExpenseCategory, id=category_id)

                # Create a mutable copy of request.data to update it
                mutable_data = request.data.copy()
                mutable_data['property'] = property_instance.id
                mutable_data['category'] = category_instance.id
                mutable_data['user'] = request.user.id  # Assuming user is authenticated

                serializer = ExpenseSerializer(data=mutable_data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return Response({"error": "Invalid property_id or category_id", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions()
def expense_detail(request, expense_id):
    expense = get_object_or_404(Expense, id=expense_id)
    if request.method == 'GET':
        serializer = ExpenseViewSerializer(expense)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        expense.is_active = False
        expense.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def expense_category(request):
    if request.method == 'GET':
        categories = ExpenseCategory.objects.filter(is_active=True)
        serializer = ExpenseCategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = ExpenseCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def expense_document(request):
    if request.method == 'GET':
        documents = ExpenseDocument.objects.filter(is_active=True)
        serializer = ExpenseDocumentViewSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = ExpenseDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
