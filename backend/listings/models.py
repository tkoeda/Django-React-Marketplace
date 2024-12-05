from django.db import models
from django.conf import settings
from django.utils.text import slugify
from storages.backends.s3boto3 import S3Boto3Storage
import uuid
from django.dispatch import receiver
from django.db.models.signals import post_delete
from django.core.files.base import ContentFile
from django.core.validators import MinValueValidator
from PIL import Image
import io
from django.db import transaction
from decimal import Decimal
import logging
logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)

# Create your models here.

class ListingManager(models.Manager):
    @transaction.atomic
    def update_listing_with_images(self, instance, validated_data, image_updates, files):
        # Update listing fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if image_updates:
        # Handle image updates
            existing_images = {str(img.id): img for img in instance.images.all()}
            images_to_delete = []
            images_to_update = []
            images_to_create = []

            for update in image_updates:
                image_id = update.get("id")
                order = update.get("order")
                delete = update.get("delete")

                if delete and image_id:
                    images_to_delete.append(image_id)
                elif image_id in existing_images:
                    existing_images[image_id].order = order
                    images_to_update.append(existing_images[image_id])
                else:
                    file_key = f"image_{order}"
                    if file_key in files:
                        unique_filename = f"{uuid.uuid4()}{files[file_key].name}"
                        images_to_create.append(
                            ListingImage(
                                listing=instance,
                                image=files[file_key],
                                order=order,
                                image_name=unique_filename
                            )
                        )

            # Process deletions
            for image_id in images_to_delete:
                image = ListingImage.objects.get(id=image_id)
                image.delete()

            # Process updates
            ListingImage.objects.bulk_update(images_to_update, ['order'])

            # Process creations
            for new_image in images_to_create:
                new_image.save()

            logger.info(f"Updated listing {instance.id}: {len(images_to_delete)} deleted, {len(images_to_update)} updated, {len(images_to_create)} created")
        return instance

    @transaction.atomic
    def create_listing_with_images(self, validated_data, image_updates, files):
        listing = self.create(**validated_data)
        
        logger.info(f"Created listing {listing.id}")
        logger.info(image_updates)
        for update in image_updates:
            order = update.get("order")
            file_key = f"image_{order}"
            logger.info(f"file_key: {file_key}")
            logger.info(f"files: {files}")
            if file_key in files:
                logger.info(f"Adding image {order} to listing {listing.id}")
                unique_filename = f"{uuid.uuid4()}{files[file_key].name}"
                ListingImage.objects.create(
                    listing=listing,
                    image=files[file_key],
                    order=order,
                    image_name=unique_filename
                )
        
        return listing




class FurnitureListing(models.Model):
    class Condition(models.TextChoices):
        NEW_WITH_TAGS = "new_with_tags", "New with tags"
        NEW_WITHOUT_TAGS = "new_without_tags", "New without tags"
        LIKE_NEW = "like_new", "Like new"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "COMPLETED"
        SOLD = "sold", "SOLD"

    class Category(models.TextChoices):
        CHAIR = "CHAIR", "Chair"
        TABLE = "TABLE", "Table"
        SOFA = "SOFA", "Sofa"
        BED = "BED", "Bed"
        DRESSER = "DRESSER", "Dresser"
        BOOKSHELF = "BOOKSHELF", "Bookshelf"
        DESK = "DESK", "Desk"
        CABINET = "CABINET", "Cabinet"
        WARDROBE = "WARDROBE", "Wardrobe"
        OTHER = "OTHER", "Other"

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="FurnitureListings",
    )
    title = models.CharField(max_length=60)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))],)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.GOOD,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    public_comments = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through="Comment", related_name="comments"
    )

    def __str__(self):
        return f"{self.title} uploaded by {self.seller}"

    objects = ListingManager()

    def update_with_images(self, validated_data, image_updates, files):
        return self.__class__.objects.update_listing_with_images(self, validated_data, image_updates, files)

    def create_with_images(self, validated_data, image_updates, files):
        return self.__class__.objects.create_listing_with_images(self, validated_data, image_updates, files)

    def update_fields(self, validated_data):
        for attr, value in validated_data.items():
            setattr(self, attr, value)
        self.save()
        return self
    
    @property
    def thumbnail(self):
        thumbnail_image = self.images.order_by("order").first()
        if thumbnail_image:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{thumbnail_image.image.name}"
        return None

def listing_path(instance, filename):
    # Get the file extension
    ext = "jpg"
    ext = filename.split(".")[-1]

    return f"listings/{instance.listing.id}/{uuid.uuid4()}.{ext}"

class CompressedImageField(models.ImageField):
    def __init__(self, *args, **kwargs):
        self.max_width = kwargs.pop("size", 1080)
        self.quality = kwargs.pop("quality", 85)
        super().__init__(*args, **kwargs)

    def pre_save(self, model_instance, add):
        file = super().pre_save(model_instance, add)
        if file and not file._committed:
            image = Image.open(file)

            # Convert image to RGB if it's not
            if image.mode != "RGB":
                image = image.convert("RGB")

            # Calculate dimensions for center crop
            width, height = image.size
            if width > height:
                left = (width - height) // 2
                top = 0
                right = left + height
                bottom = height
            else:
                left = 0
                top = (height - width) // 2
                right = width
                bottom = top + width

            # Crop to square
            image = image.crop((left, top, right, bottom))

            # Resize to 1080x1080
            image = image.resize((self.size, self.size), Image.LANCZOS)

            output = io.BytesIO()
            image.save(output, format="JPEG", quality=self.quality, optimize=True)
            output.seek(0)

            # Generate a new filename without random strings
            new_filename = listing_path(model_instance, file.name)

            # Save the compressed image
            model_instance.image.save(new_filename, output, save=False)

            # Close the original file to prevent it from being saved
            file.close()

        return model_instance.image


class ListingImage(models.Model):
    listing = models.ForeignKey(
        FurnitureListing, on_delete=models.CASCADE, related_name="images"
    )
    image = CompressedImageField(
        storage=S3Boto3Storage(),
        upload_to=listing_path,
    )
    image_name = models.CharField(max_length=255, unique=True, blank=True)
    order = models.PositiveIntegerField(default=1)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("listing", "order")
        ordering = ["order"]

    def __str__(self):
        return f"Image {self.order} for Listing {self.listing.id}"

    def save(self, *args, **kwargs):
        if not self.image_name:
            self.image_name = f"{uuid.uuid4()}{self.image.name}"
        if self.pk:
            old_instance = ListingImage.objects.get(pk=self.pk)
            if old_instance.image != self.image:
                old_instance.image.delete(save=False)
        super().save(*args, **kwargs)
        

@receiver(post_delete, sender=ListingImage)
def delete_s3_image(sender, instance, **kwargs):
    # Delete the file from S3
    instance.image.delete(save=False)


@receiver(post_delete, sender=FurnitureListing)
def delete_listing_images(sender, instance, **kwargs):
    # Delete all associated images when a listing is deleted
    for image in instance.images.all():
        image.delete()

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    listing = models.ForeignKey(FurnitureListing, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Purchase(models.Model):
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='purchases'
    )
    listing = models.ForeignKey(
        FurnitureListing,
        on_delete=models.CASCADE,
        related_name='purchases'
    )
    purchase_date = models.DateTimeField(auto_now_add=True)
    price_at_time_of_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['-purchase_date']
        unique_together = ['listing', 'buyer']  # Prevent duplicate purchases

    def __str__(self):
        return f"{self.buyer.username} purchased {self.listing.title}"
