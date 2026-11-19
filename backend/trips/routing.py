from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/terminal/(?P<terminal_id>\w+)/board/$', consumers.TerminalBoardConsumer.as_asgi()),
    re_path(r'ws/passenger/(?P<user_id>\w+)/$', consumers.PassengerConsumer.as_asgi()),
]
