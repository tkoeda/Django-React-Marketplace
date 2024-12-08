import os
import dj_database_url
from .settings import *
from .settings import BASE_DIR
import environ

env = environ.Env(DEBUG=(bool, False))


ALLOWED_HOSTS = [
    env("RENDER_EXTERNAL_HOSTNAME"),
    "api.taikoeda.jp",
]
CSRF_TRUSTED_ORIGINS = ["https://" + env("RENDER_EXTERNAL_HOSTNAME")]

DEBUG = False
SECRET_KEY = env("SECRET_KEY")

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    "https://marketplace-react-rz2n.onrender.com",
    "https://taikoeda.jp",
    "https://www.taikoeda.jp",
]

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

DATABASES = {
    "default": dj_database_url.config(default=env("DATABASE_URL"), conn_max_age=600)
}


AUTH_USER_MODEL = "users.User"

# S3 Configuration
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = env(
    "AWS_STORAGE_BUCKET_NAME"
)  # Replace with your actual bucket name
AWS_S3_REGION_NAME = env("AWS_S3_REGION_NAME")
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_EXPIRE = 600
AWS_S3_CUSTOM_DOMAIN = env("CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME")
