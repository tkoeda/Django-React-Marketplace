from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):
    """
    Custom user model extending AbstractUser.
    """
    number_of_active_listings = models.PositiveIntegerField(default=0)
    number_of_sold_listings = models.PositiveIntegerField(default=0)

    username = models.CharField(
        max_length=150,
        unique=True,
        error_messages={
            'unique': "This username is already taken."  
        }
    )

    def __str__(self):
        return self.username
