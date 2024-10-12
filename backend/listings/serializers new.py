from rest_framework import serializers
from .models import FurnitureListing, Comment, ListingImage
from django.contrib.auth import get_user_model
from backend.utils import get_s3_url, S3ImageField
from botocore.config import Config
from django.conf import settings
from django.db.models import Max
import boto3
from django.db import transaction
import logging
import json
import time
from backend.decorators import profile

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)

User = get_user_model()


class ListingImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ["id", "image_url", "order"]

    def get_image_url(self, obj):
        if obj.image:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{obj.image.name}"
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
        ]

    def get_thumbnail(self, obj):
        thumbnail_image = obj.images.order_by("order").first()
        if thumbnail_image:
            return thumbnail_image.image.url
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        thumbnail_image = instance.images.order_by("order").first()
        if thumbnail_image:
            representation["thumbnail"] = (
                f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{thumbnail_image.image.name}"
            )
        else:
            representation["thumbnail"] = None
        return representation


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

    def create(self, validated_data):
        image_updates = validated_data.pop("image_updates", [])
        listing = FurnitureListing.objects.create(**validated_data)

        for update in image_updates:
            if "image" in update:
                ListingImage.objects.create(
                    listing=listing, image=update["image"], order=update["order"]
                )
        return listing
    
    def update(self, instance, validated_data):
        print(f"Updating listing {instance.id}")
        request = self.context.get("request")
        if request:
            image_updates = json.loads(request.data.get("image_updates", "[]"))

            # Update the listing fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            # Handle image updates
            if image_updates:
                self.handle_image_updates(instance, image_updates, request.FILES)
        print(validated_data)
        return instance

    @profile
    def handle_image_updates(self, instance, image_updates, files):
        existing_images = {
            str(img.id): img
            for img in instance.images.filter(
                id__in=[
                    update.get("id") for update in image_updates if update.get("id")
                ]
            )
        }
        images_to_update = []
        images_to_create = []
        image_ids_to_keep = []

        for index, update in enumerate(image_updates):
            image_id = update.get("id")
            if image_id:
                if not update.get("delete"):
                    image_ids_to_keep.append(image_id)
                    existing_images[str(image_id)].order = update["order"]
                    images_to_update.append(existing_images[str(image_id)])
            else:
                file_key = f"image_{index}"
                if file_key in files:
                    images_to_create.append(
                        ListingImage(
                            listing=instance,
                            image=files[file_key],
                            order=update["order"],
                        )
                    )

        # Delete images
        ListingImage.objects.filter(listing=instance).exclude(id__in=image_ids_to_keep).delete()

        # Update order of existing images
        if images_to_update:
            ListingImage.objects.bulk_update(images_to_update, ["order"])

        # Create new images
        if images_to_create:
            ListingImage.objects.bulk_create(images_to_create)

        # logger.info(f"Received image updates: {image_updates}")
        # logger.info(f"Updated image order: {new_order}")
        # logger.info(f"Images to delete: {images_to_delete}")
        # logger.info(f"Images to create: {len(images_to_create)}")


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
