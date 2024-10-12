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
    new_images = serializers.ListField(
        child=serializers.ImageField(
            max_length=1000000, allow_empty_file=False, use_url=False
        ),
        write_only=True,
        required=False,
    )
    deleted_images = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    image_order = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

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
            "new_images",
            "seller",
            "image_order",
            "deleted_images",
        ]

    def create(self, validated_data):
        new_images = validated_data.pop("new_images", [])
        listing = FurnitureListing.objects.create(**validated_data)

        for order, image in enumerate(new_images, start=1):
            ListingImage.objects.create(listing=listing, image=image, order=order)

        return listing

    @transaction.atomic
    def update(self, instance, validated_data):
        print(f"Updating listing {instance.id}")
        new_images = validated_data.pop("new_images", [])
        image_ids_to_delete = validated_data.pop("deleted_images", [])
        image_order = validated_data.pop("image_order", [])
        
        logger.info("image ids to delete: %s", image_ids_to_delete)
        logger.info("image order: %s", image_order)


        # Update the listing fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        try:
            instance.save()
        except Exception as e:
            # logger.error(f"Error updating listing {instance.id}: {str(e)}")
            raise serializers.ValidationError(f"Error updating listing: {str(e)}")

        # Handle image deletions
        if image_ids_to_delete:
            deleted_count, _ = ListingImage.objects.filter(
                id__in=image_ids_to_delete, listing=instance
            ).delete()
            logger.info(f"Deleted {deleted_count} images from listing {instance.id}")

        # Add new images
        if new_images:
            max_order = (
                ListingImage.objects.filter(listing=instance).aggregate(Max("order"))[
                    "order__max"
                ]
                or 0
            )
            new_image_objects = []
            for index, image_data in enumerate(new_images):
                try:
                    new_image_objects.append(
                        ListingImage(
                            listing=instance,
                            image=image_data,
                            order=max_order + index + 1,
                        )
                    )
                except Exception as e:
                    logger.error(
                        f"Error preparing new image for listing {instance.id}: {str(e)}"
                    )

            try:
                ListingImage.objects.bulk_create(new_image_objects)
            except Exception as e:
                raise serializers.ValidationError(f"Error adding new images: {str(e)}")

        # Reorder images
        if image_order:
            try:
                all_images = ListingImage.objects.filter(listing=instance)
                image_dict = {image.id: image for image in all_images}
                for index, image_id in enumerate(new_image_order):
                    if image_id in image_dict:
                        image_dict[image_id].order = index + 1
                        image_dict[image_id].save()
                logger.info(f"Reordered images for listing {instance.id}")
            except Exception as e:
                logger.error(
                    f"Error reordering images for listing {instance.id}: {str(e)}"
                )
                raise serializers.ValidationError(f"Error reordering images: {str(e)}")
        else:
            # If no new order provided, ensure consistency by ordering based on current order
            for index, image in enumerate(all_images.order_by("order")):
                image.order = index + 1
                image.save()

        return instance


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
