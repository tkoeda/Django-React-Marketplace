# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import (
#     FurnitureListingViewSet, 
#     CommentViewSet, 
#     ListingImageUploadView, 
# )

# router = DefaultRouter()
# router.register(r'', FurnitureListingViewSet, basename='listing')
# router.register(r'comments', CommentViewSet, basename='comment')

# urlpatterns = [
#     path('', include(router.urls)),
#     path('<int:listing_id>/upload-image/', ListingImageUploadView.as_view(), name='listing-image-upload'),
# ]
