from django.urls import path
from .views import (
    TerminalListView,
    TerminalDetailView,
    DestinationZoneListCreateView,
    PublicBoardSnapshotView,
)

urlpatterns = [
    path('terminals/', TerminalListView.as_view(), name='terminal_list'),
    path('terminals/<slug:code>/', TerminalDetailView.as_view(), name='terminal_detail'),
    path('destinations/', DestinationZoneListCreateView.as_view(), name='destinations_list'),
    path('public/board/<slug:code>/', PublicBoardSnapshotView.as_view(), name='public_board_snapshot'),
]
