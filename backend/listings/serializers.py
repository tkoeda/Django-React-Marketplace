from rest_framework import serializers
from .models import FurnitureListing, Comment, ListingImage
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction
import json
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class ListingImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ["id", "image_url", "order"]

    def get_image_url(self, obj):
        if obj.image:
            print(obj.image.url)
            return obj.image.url
        return None


class ImageUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    image = serializers.ImageField(required=False)
    order = serializers.IntegerField()
    delete = serializers.BooleanField(required=False, default=False)


class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
        ]


class ListingListSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ReadOnlyField()

    class Meta:
        model = FurnitureListing
        fields = [
            "id",
            "title",
            "description",
            "price",
            "created_at",
            "status",
            "category",
            "thumbnail",
        ]

class ListingDetailSerializer(serializers.ModelSerializer):
    condition_display = serializers.CharField(
        source="get_condition_display", read_only=True
    )
    images = ListingImageSerializer(many=True, read_only=True)
    image_updates = ImageUpdateSerializer(many=True, required=False, write_only=True)
    seller = SellerSerializer(read_only=True)

    class Meta:
        model = FurnitureListing
        fields = [
            "id",
            "title",
            "description",
            "price",
            "created_at",
            "status",
            "category",
            "description",
            "condition",
            "condition_display",
            "updated_at",
            "images",
            "image_updates",
            "seller",
        ]

    def validate(self, data):
        print("here")
        if data.get("status") == "published":
            required_fields = ["title", "price", "category", "condition"]
            missing_fields = [field for field in required_fields if not data.get(field)]

            if missing_fields:
                raise serializers.ValidationError(
                    f"For published listings, these fields are required: {', '.join(missing_fields)}"
                )
        return data

    def create(self, validated_data):
        request = self.context.get("request")
        image_updates = json.loads(request.data.get("image_updates", "[]"))

        listing = FurnitureListing.objects.create_listing_with_images(
            validated_data, image_updates, request.FILES
        )

        return listing

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request:
            logger.info("updating instance with images")
            image_updates = json.loads(request.data.get("image_updates", "[]"))
            return instance.update_with_images(
                validated_data, image_updates, request.FILES
            )

        logger.info("updating instance without images")
        # Update the instance fields without processing images
        return super().update(instance, validated_data)


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    listing = serializers.PrimaryKeyRelatedField(
        queryset=FurnitureListing.objects.all()
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "listing",
            "content",
            "created_at",
        ]
