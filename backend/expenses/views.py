from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging
from .serializers import ExpenseSerializer, ExpenseCategorySerializer, ExpenseDocumentSerializer, ExpenseDocumentViewSerializer, ExpenseViewSerializer
from .models import Expense, ExpenseCategory, ExpenseDocument
from django.conf import settings
from users.decorators import custom_authentication_and_permissions
from django.shortcuts import get_object_or_404
from property.models import Property
from users.models import HsUser, UserHsPermission

logger = logging.getLogger("expenses")


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def expense(request):
    logger.info(f"expense called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        user_id = request.query_params.get("user_id")
        if user_id:
            user = get_object_or_404(HsUser, id=user_id)
        else:
            user = request.user

        is_admin = UserHsPermission.objects.filter(user=user, permission_group__name="admin").exists()
        if is_admin:
            expenses = Expense.objects.all()
        else:
            expenses = Expense.objects.filter(user=user)
        serializer = ExpenseViewSerializer(expenses, many=True)
        logger.info(f"Retrieved {len(serializer.data)} expenses for user {user.id}", extra={"request_method": request.method, "user_id": user.id, "count": len(serializer.data)})
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
                    logger.info(f"Expense created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "expense_id": serializer.data.get('id'), "property_id": property_id, "category_id": category_id})
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                logger.warning(f"Failed to create expense: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                logger.exception(f"Error creating expense: {str(e)}", extra={"request_method": request.method, "property_id": property_id, "category_id": category_id})
                return Response({"error": "Invalid property_id or category_id", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        logger.warning(f"Failed to create expense: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions()
def expense_detail(request, expense_id):
    logger.info(f"expense_detail called with method {request.method} for expense_id {expense_id}", extra={"request_method": request.method, "expense_id": expense_id})
    expense = get_object_or_404(Expense, id=expense_id)
    if request.method == 'GET':
        serializer = ExpenseViewSerializer(expense)
        logger.info(f"Retrieved expense {expense_id}", extra={"request_method": request.method, "expense_id": expense_id})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Expense {expense_id} updated successfully", extra={"request_method": request.method, "expense_id": expense_id})
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.warning(f"Failed to update expense {expense_id}: {serializer.errors}", extra={"request_method": request.method, "expense_id": expense_id, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        expense.is_active = False
        expense.save()
        logger.info(f"Expense {expense_id} deactivated successfully", extra={"request_method": request.method, "expense_id": expense_id})
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def expense_category(request):
    logger.info(f"expense_category called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        categories = ExpenseCategory.objects.filter(is_active=True)
        serializer = ExpenseCategorySerializer(categories, many=True)
        logger.info(f"Retrieved {len(serializer.data)} expense categories", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = ExpenseCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Expense category created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "category_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create expense category: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions()
def expense_document(request):
    logger.info(f"expense_document called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        documents = ExpenseDocument.objects.filter(is_active=True)
        serializer = ExpenseDocumentViewSerializer(documents, many=True)
        logger.info(f"Retrieved {len(serializer.data)} expense documents", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        logger.info("Expense document upload endpoint called", extra={"request_method": request.method})
        return Response({'message': 'Expense document uploaded successfully.'}, status=status.HTTP_201_CREATED)
    
@api_view(['GET', 'POST', 'DELETE'])
@custom_authentication_and_permissions()
def expense_document_upload(request, pk):
    logger.info(f"expense_document_upload called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    if request.method == 'GET':
        expense = get_object_or_404(Expense, id=pk)
        documents = ExpenseDocument.objects.filter(expense=expense)
        serializer = ExpenseDocumentViewSerializer(documents, many=True)
        logger.info(f"Retrieved {len(serializer.data)} documents for expense {pk}", extra={"request_method": request.method, "expense_id": pk, "count": len(serializer.data)})
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        expense = get_object_or_404(Expense, id=pk)
        user = request.user
        serializer = ExpenseDocumentSerializer(data={'expense': expense.id, 'document': request.FILES['document'], 'user': user.id})
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Expense document uploaded successfully for expense {pk} with id {serializer.data.get('id')}", extra={"request_method": request.method, "expense_id": pk, "document_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to upload expense document for expense {pk}: {serializer.errors}", extra={"request_method": request.method, "expense_id": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        document = get_object_or_404(ExpenseDocument, id=pk)
        document.delete()
        logger.info(f"Expense document {pk} deleted successfully", extra={"request_method": request.method, "document_id": pk})
        return Response({'message': 'Document deleted successfully'}, status=status.HTTP_200_OK)
