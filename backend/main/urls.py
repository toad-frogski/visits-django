from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from channels.routing import URLRouter

from visits import urls as visits_urls
from rfid import urls as rfid_urls
from session import urls as session_urls
from redmine import urls as redmine_urls

urlpatterns = [
    path("api/admin/", admin.site.urls),
    # api schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # app routes
    path('api/v1/session/', include(session_urls)),
    path("api/v1/visits/", include(visits_urls.urlpatterns)),
    path("api/v1/rfid/", include(rfid_urls.urlpatterns)),
    path("api/v1/redmine/", include(redmine_urls.urlpatterns))
]

websocket_urlpatterns =[
    path("api/ws/visits", URLRouter(visits_urls.websocket_urlpatterns))
]
