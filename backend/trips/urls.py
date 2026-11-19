from django.urls import path
from .views import (
    FareCalculateView,
    JoinQueueView,
    MyQueueStatusView,
    CancelQueueView,
    DriverManualDispatchView,
    TripTicketDetailView,
)

urlpatterns = [
    path('fare/calculate/', FareCalculateView.as_view(), name='fare_calculate'),
    path('queue/join/', JoinQueueView.as_view(), name='queue_join'),
    path('queue/my-status/', MyQueueStatusView.as_view(), name='queue_my_status'),
    path('queue/<int:entry_id>/cancel/', CancelQueueView.as_view(), name='queue_cancel'),
    path('driver/dispatch-override/', DriverManualDispatchView.as_view(), name='driver_dispatch_override'),
    path('trips/ticket/<str:token>/', TripTicketDetailView.as_view(), name='trip_ticket_detail'),
]
