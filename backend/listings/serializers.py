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
import uuid

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

    @transaction.atomic
    def update(self, instance, validated_data):
        print(f"Updating listing {instance.id}")
        request = self.context.get('request')
        if request:
            start_time = time.time()
            image_updates = json.loads(request.data.get('image_updates', '[]'))
            json_load_time = time.time() - start_time
            print(f"JSON loading time: {json_load_time}")

            start_time = time.time()
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            instance_update_time = time.time() - start_time
            print(f"Instance update time: {instance_update_time}")

            logger.info("request files %s", request.FILES)
            if image_updates:
                start_time = time.time()
                self.handle_image_updates(instance, image_updates, request.FILES)
                image_update_time = time.time() - start_time
                print(f"Image update time: {image_update_time}")

        return instance

    def handle_image_updates(self, instance, image_updates, files):
        existing_images = {str(img.id): img for img in instance.images.all()}
        images_to_delete = []
        images_to_update = []
        images_to_create = []
        
        for update in image_updates:
            image_id = update.get("id")
            order = update.get("order")
            delete = update.get("delete")

            if delete:
                if image_id:
                    images_to_delete.append(image_id)
            elif image_id:
                if image_id in existing_images:
                    existing_images[image_id].order = order
                    images_to_update.append(existing_images[image_id])
            else:
                file_key = f"image_{order - 1}"
                if file_key in files:
                    # Generate a unique filename for the new image
                    unique_filename = f"{uuid.uuid4()}{files[file_key].name}"
                    images_to_create.append(
                        ListingImage(
                            listing=instance,
                            image=files[file_key],
                            order=order,
                            image_name=unique_filename  # Add this field to your ListingImage model
                        )
                    )

        # Delete images
        for image_id in images_to_delete:
            image = ListingImage.objects.get(id=image_id)
            image.image.delete(save=False)  # Delete the file from S3
            image.delete()  # Delete the database record

        # Update existing images
        ListingImage.objects.bulk_update(images_to_update, ['order'])

        # Create new images
        for new_image in images_to_create:
            new_image.save()  # Save each new image individually to trigger the custom save method

        logger.info(f"Updated listing {instance.id}: {len(images_to_delete)} deleted, {len(images_to_update)} updated, {len(images_to_create)} created")
         
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
