from django.conf import settings
from rest_framework import serializers
import logging

def get_s3_url(path):
    if settings.DEFAULT_FILE_STORAGE == 'storages.backends.s3boto3.S3Boto3Storage':
        return f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{path}"
    return path  # Return the original path if not using S3

class S3ImageField(serializers.ImageField):
    def to_representation(self, value):
        if value:
            return get_s3_url(value.name)
        return None


def get_logger(name):
    return logging.getLogger(name)
