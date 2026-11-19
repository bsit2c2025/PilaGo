from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    PendingDiscountListView,
    VerifyDiscountView,
)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', UserRegistrationView.as_view(), name='user_register'),
    path('users/profile/', UserProfileView.as_view(), name='user_profile'),
    path('admin/discounts/pending/', PendingDiscountListView.as_view(), name='pending_discounts'),
    path('admin/discounts/<int:pk>/verify/', VerifyDiscountView.as_view(), name='verify_discount'),
]
