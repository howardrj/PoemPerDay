from django.conf.urls import url
from rest_framework.routers import DefaultRouter

from poem_per_day import views

router = DefaultRouter()

router.register(r'^api/poems', views.PoemViewSet)

urlpatterns = [
    url(r'^poem_of_the_day/$', views.poem_of_the_day),
]
