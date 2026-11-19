from django.urls import path
from .views import (
    DriverProfileDetailView,
    DriverCheckInView,
    DriverStatusUpdateView,
    DriverCurrentAssignmentView,
    CompleteTripView,
)

urlpatterns = [
    path('driver/profile/', DriverProfileDetailView.as_view(), name='driver_profile'),
    path('driver/check-in/', DriverCheckInView.as_view(), name='driver_check_in'),
    path('driver/status/', DriverStatusUpdateView.as_view(), name='driver_status_update'),
    path('driver/current-assignment/', DriverCurrentAssignmentView.as_view(), name='driver_current_assignment'),
    path('driver/dispatch/<int:dispatch_id>/complete/', CompleteTripView.as_view(), name='driver_complete_trip'),
]
