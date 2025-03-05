from rest_framework import serializers
from .models import Expense, ExpenseCategory, ExpenseDocument
from django.conf import settings
from property.serializers import PropertySerializer

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

class ExpenseViewSerializer(serializers.ModelSerializer):
    property = PropertySerializer()
    category = ExpenseCategorySerializer()
    class Meta:
        model = Expense
        fields = '__all__'



class ExpenseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseDocument
        fields = '__all__'


class ExpenseDocumentViewSerializer(serializers.ModelSerializer):
    document = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseDocument
        fields = ['id', 'document']

    def get_document(self, obj):
        return f"{settings.MEDIA_URL}{obj.document.url}"