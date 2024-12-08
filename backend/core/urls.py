from django.contrib import admin
from django.urls import path, include
from users.views import CreateUserView
from rest_framework.routers import DefaultRouter
from listings.views import (
    HomePageListingsView,
    MyPageListingsView,
    ListingDetailView,
    ListingViewSet,
    PurchasedListingsView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from authentication.views import MyTokenObtainPairView

router = DefaultRouter()
router.register(r"listings", ListingViewSet, basename="listing")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("api/users/", include("users.urls")),
    # Listings
    path("api/", include(router.urls)),
    path("api/homepage/", HomePageListingsView.as_view(), name="homepage"),
    path("api/listings/details/<str:listing_id>/", ListingDetailView.as_view(), name="listing-details"),
    
    # My Page URLs
    path("api/mylistings/<str:status>/", MyPageListingsView.as_view(), name="my-listings"),
    path('api/purchases/', PurchasedListingsView.as_view(), name='purchased-listings'),
]
