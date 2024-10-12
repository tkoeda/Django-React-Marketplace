from django.db import models
from django.conf import settings
from django.utils.text import slugify
from storages.backends.s3boto3 import S3Boto3Storage
import uuid
from django.dispatch import receiver
from django.db.models.signals import post_delete
from django.core.files.base import ContentFile
from PIL import Image
import io
# Create your models here.


def listing_path(instance, filename):
    # Get the file extension
    ext = "jpg"
    ext = filename.split(".")[-1]

    return f"listings/{instance.listing.id}/{instance.image_name}{ext}"


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
    price = models.DecimalField(max_digits=10, decimal_places=2)
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
