from django.conf.urls import url, include
from rest_framework.routers import SimpleRouter

from poem_per_day import views

router = SimpleRouter()

router.register(r'^api/poems', views.PoemViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^poem_per_day/$', views.poem_per_day_main),
]
