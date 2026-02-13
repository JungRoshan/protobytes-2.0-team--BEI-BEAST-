from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, DepartmentViewSet

router = DefaultRouter()
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    path('', include(router.urls)),
]
