from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import FurnitureListing, ListingImage, Purchase
from .serializers import ListingListSerializer, ListingDetailSerializer
from backend.permissions import IsOwnerOrReadOnly
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import APIException
from django.db import transaction
import uuid
import json
from django.core.files.storage import default_storage
import logging

logger = logging.getLogger(__name__)


def temp_upload(request):
    if "image" not in request.FILES:
        return Response({"error": "No image file provided"}, status=400)

    image = request.FILES["image"]
    temp_id = str(uuid.uuid4())

    # Save to temporary storage (this could be a local folder or a separate S3 bucket)
    temp_path = f"temp/{temp_id}_{image.name}"
    default_storage.save(temp_path, image)

    temp_url = default_storage.url(temp_path)

    return Response({"temp_id": temp_id, "image_url": temp_url})


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filterset_fields = ["condition", "price", "brand"]
    search_fields = ["title", "description", "brand"]
    ordering_fields = ["price", "created_at"]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = FurnitureListing.objects.all()
        return queryset

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(seller=self.request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        serializer.save()
        return Response(serializer.data)

    # def perform_create(self, serializer):
    #     print("performing create")
    #     listing = serializer.save()
    #     images = self.request.FILES.getlist("images")
    #     for order, image in enumerate(images, start=1):
    #         ListingImage.objects.create(listing=listing, image=image, order=order)

    def retrieve(self, request, pk=None):
        queryset = FurnitureListing.objects.all()
        listing = get_object_or_404(queryset, pk=pk)
        serializer = self.get_serializer(listing)
        data = serializer.data
        is_owner = request.user == listing.seller
        data["is_owner"] = is_owner
        return Response(serializer.data)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def save_listing(self, request, pk=None):
        listing = self.get_object()
        request.user.saved_listings.add(listing)
        return Response({"status": "listing saved"})

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def remove_saved_listing(self, request, pk=None):
        listing = self.get_object()
        request.user.saved_listings.remove(listing)
        return Response({"status": "listing removed"})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def purchase(self, request, pk=None):
        listing = self.get_object()
        
        # Check if listing is already sold
        if listing.status == 'sold':
            return Response(
                {"error": "This item has already been sold"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is trying to buy their own listing
        if listing.seller == request.user:
            return Response(
                {"error": "You cannot buy your own listing"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use transaction to ensure atomicity
        try:
            with transaction.atomic():
                # Create purchase record
                Purchase.objects.create(
                    buyer=request.user,
                    listing=listing,
                    price_at_time_of_purchase=listing.price
                )
                
                # Update listing status
                listing.status = 'sold'
                listing.save()
        
            return Response({
                "message": "Purchase successful",
                "listing_id": listing.id,
            }, status=status.HTTP_200_OK)
            
        except IntegrityError:
            return Response(
                {"error": "This item has already been purchased"},
                status=status.HTTP_400_BAD_REQUEST
            )


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class HomePageListingsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ListingListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = FurnitureListing.objects.filter(status="published")

        if self.request.user.is_authenticated:
            queryset = queryset.exclude(seller=self.request.user)

        return queryset


class MyPageListingsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ListingListSerializer

    def get_queryset(self):
        status = self.kwargs.get("status", "published")
        queryset = FurnitureListing.objects.filter(
            seller=self.request.user, status=status
        )

        return queryset


class PurchasedListingsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ListingListSerializer

    def get_queryset(self):
        purchases = FurnitureListing.objects.filter(
            purchases__buyer=self.request.user
        ).order_by('-purchases__purchase_date')
        print(purchases)
        return purchases
        
class ListingDetailView(generics.RetrieveAPIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = ListingDetailSerializer

    def get_object(self):
        listing_id = self.kwargs.get("listing_id")
        try:
            listing = (
                FurnitureListing.objects.select_related("seller")
                .prefetch_related("images")
                .get(id=listing_id, status="published")
            )

            return listing
        except FurnitureListing.DoesNotExist:
            raise APIException(
                f"Published FurnitureListing with id {listing_id} not found."
            )
