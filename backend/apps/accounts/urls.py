from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, UserMeView, StaffUserViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('users', StaffUserViewSet, basename='staff-user')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('me/', UserMeView.as_view(), name='me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
