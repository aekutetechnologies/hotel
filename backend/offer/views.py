# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging
from .models import Offer, OfferImage, PropertyOffer
from .serializers import OfferViewSerializer, OfferSerializer, OfferImageSerializer
from users.decorators import custom_authentication_and_permissions
from property.models import Property
from django.db import transaction

logger = logging.getLogger("offer")


@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/offers/offers/$"])
def offer_list(request):
    logger.info(f"offer_list called with method {request.method}", extra={"request_method": request.method})
    if request.method == 'GET':
        offers = Offer.objects.all()
        serializer = OfferViewSerializer(offers, many=True)
        logger.info(f"Retrieved {len(serializer.data)} offers", extra={"request_method": request.method, "count": len(serializer.data)})
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = OfferSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Offer created successfully with id {serializer.data.get('id')}", extra={"request_method": request.method, "offer_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create offer: {serializer.errors}", extra={"request_method": request.method, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'DELETE'])
@custom_authentication_and_permissions(required_permissions=['admin:offer:update'])
def assign_offers(request):
    """
    POST: Assign one or more offers to one or more properties.
      Body: { "offer_ids": [1,2], "property_ids": [10,11] }
    DELETE: Unassign offers from properties.
      Body: { "offer_ids": [1,2], "property_ids": [10,11] }
    """
    logger.info(f"assign_offers called with method {request.method}", extra={"request_method": request.method, "offer_ids": request.data.get('offer_ids', []), "property_ids": request.data.get('property_ids', [])})
    offer_ids = request.data.get('offer_ids', [])
    property_ids = request.data.get('property_ids', [])

    if not isinstance(offer_ids, list) or not isinstance(property_ids, list):
        logger.warning(f"Invalid offer_ids or property_ids format", extra={"request_method": request.method, "offer_ids": offer_ids, "property_ids": property_ids})
        return Response({'error': 'offer_ids and property_ids must be lists'}, status=status.HTTP_400_BAD_REQUEST)
    if len(offer_ids) == 0 or len(property_ids) == 0:
        logger.warning(f"Empty offer_ids or property_ids", extra={"request_method": request.method, "offer_ids": offer_ids, "property_ids": property_ids})
        return Response({'error': 'offer_ids and property_ids cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

    offers = list(Offer.objects.filter(id__in=offer_ids))
    properties = list(Property.objects.filter(id__in=property_ids))

    if not offers or not properties:
        logger.warning(f"No matching offers or properties found", extra={"request_method": request.method, "offer_ids": offer_ids, "property_ids": property_ids})
        return Response({'error': 'No matching offers or properties found'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        created = 0
        with transaction.atomic():
            for prop in properties:
                for off in offers:
                    _, was_created = PropertyOffer.objects.get_or_create(property=prop, offer=off)
                    if was_created:
                        created += 1
        logger.info(f"Offers assigned successfully: {created} assignments created", extra={"request_method": request.method, "created": created, "offer_ids": offer_ids, "property_ids": property_ids})
        return Response({'message': 'Offers assigned successfully', 'created': created}, status=status.HTTP_200_OK)

    # DELETE
    with transaction.atomic():
        qs = PropertyOffer.objects.filter(property_id__in=[p.id for p in properties], offer_id__in=[o.id for o in offers])
        deleted = qs.count()
        qs.delete()
    logger.info(f"Offers unassigned successfully: {deleted} assignments deleted", extra={"request_method": request.method, "deleted": deleted, "offer_ids": offer_ids, "property_ids": property_ids})
    return Response({'message': 'Offers unassigned successfully', 'deleted': deleted}, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'DELETE'])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/offers/offers/\d+/?$"])
def offer_detail(request, pk):
    logger.info(f"offer_detail called with method {request.method} for pk {pk}", extra={"request_method": request.method, "pk": pk})
    try:
        offer = Offer.objects.get(pk=pk)
    except Offer.DoesNotExist:
        logger.warning(f"Offer {pk} not found", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OfferViewSerializer(offer)
        logger.info(f"Retrieved offer {pk}", extra={"request_method": request.method, "pk": pk})
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = OfferSerializer(offer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Offer {pk} updated successfully", extra={"request_method": request.method, "pk": pk})
            return Response(serializer.data)
        logger.warning(f"Failed to update offer {pk}: {serializer.errors}", extra={"request_method": request.method, "pk": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        offer.delete()
        logger.info(f"Offer {pk} deleted successfully", extra={"request_method": request.method, "pk": pk})
        return Response(status=status.HTTP_204_NO_CONTENT)




@api_view(['GET', 'POST'])
@custom_authentication_and_permissions(exempt_get_views=[r"^/api/offers/offer-images/\d+/?$"])
def offer_image_list(request, pk):
    logger.info(f"offer_image_list called with method {request.method} for offer {pk}", extra={"request_method": request.method, "offer_id": pk})
    try:
        offer = Offer.objects.get(id=pk)
    except Offer.DoesNotExist:
        logger.warning(f"Offer {pk} not found for image list", extra={"request_method": request.method, "offer_id": pk})
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        offer_images = OfferImage.objects.filter(offer=offer)
        serializer = OfferImageSerializer(offer_images, many=True)
        logger.info(f"Retrieved {len(serializer.data)} images for offer {pk}", extra={"request_method": request.method, "offer_id": pk, "count": len(serializer.data)})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new OfferImage instance and associate it with the offer
        serializer = OfferImageSerializer(data=request.data)
        if serializer.is_valid():
            # Set the offer field before saving
            serializer.save(offer=offer)  # Associate the image with the offer
            logger.info(f"Offer image created successfully with id {serializer.data.get('id')} for offer {pk}", extra={"request_method": request.method, "offer_id": pk, "image_id": serializer.data.get('id')})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.warning(f"Failed to create offer image for offer {pk}: {serializer.errors}", extra={"request_method": request.method, "offer_id": pk, "errors": serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
