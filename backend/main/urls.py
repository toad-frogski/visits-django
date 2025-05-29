from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from visits import urls as visits_urls
from rfid import urls as rfid_urls
from users import urls as users_urls


urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/visits/", include(visits_urls.urlpatterns)),
    path("api/v1/rfid/", include(rfid_urls.urlpatterns)),
    path("api/v1/users/", include(users_urls)),
]
