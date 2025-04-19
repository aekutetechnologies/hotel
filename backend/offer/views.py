# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Offer, OfferImage
from .serializers import OfferViewSerializer, OfferSerializer, OfferImageSerializer
from users.decorators import custom_authentication_and_permissions



@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/offers/offers/$"])
def offer_list(request):
    if request.method == 'GET':
        offers = Offer.objects.all()
        serializer = OfferViewSerializer(offers, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = OfferSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/offers/offers/\d+/?$"])
def offer_detail(request, pk):
    try:
        offer = Offer.objects.get(pk=pk)
    except Offer.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OfferViewSerializer(offer)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = OfferSerializer(offer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        offer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/offers/offer-images/\d+/?$"])
def offer_image_list(request, pk):
    try:
        offer = Offer.objects.get(id=pk)
    except Offer.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        offer_images = OfferImage.objects.filter(offer=offer)
        serializer = OfferImageSerializer(offer_images, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new OfferImage instance and associate it with the offer
        serializer = OfferImageSerializer(data=request.data)
        if serializer.is_valid():
            # Set the offer field before saving
            serializer.save(offer=offer)  # Associate the image with the offer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
