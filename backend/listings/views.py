from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import FurnitureListing, ListingImage
from .serializers import ListingListSerializer, ListingDetailSerializer
from backend.permissions import IsOwnerOrReadOnly
from rest_framework.decorators import api_view
from django.db.models import Prefetch, OuterRef, Subquery
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import APIException
from django.db import transaction
from django.db.models import Max


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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save the listing
        listing = serializer.save(seller=self.request.user)

        # Handle image uploads
        images = request.FILES.getlist("images")
        for image in images:
            ListingImage.objects.create(listing=listing, image=image)

        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_create(self, serializer):
        print("performing create")
        listing = serializer.save()
        images = self.request.FILES.getlist("images")
        for order, image in enumerate(images, start=1):
            ListingImage.objects.create(listing=listing, image=image, order=order)

    def perform_update(self, serializer):
        serializer.save()

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


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class HomePageListingsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ListingListSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = FurnitureListing.objects.filter(status='published')

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


class ListingDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
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
