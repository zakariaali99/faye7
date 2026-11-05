from rest_framework import status, permissions, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.contrib.auth.models import User
from .serializers import UserSerializer, LoginSerializer, StaffUserSerializer

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                update_last_login(None, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            return Response({'error': 'بيانات الاعتماد غير صحيحة'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff and request.user.is_superuser)

class StaffUserViewSet(viewsets.ModelViewSet):
    """Owners add, edit, deactivate and remove dashboard users. Records are looked up by id."""
    serializer_class = StaffUserSerializer
    permission_classes = [IsOwner]
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(is_staff=True).order_by('-is_superuser', 'username')

    def _other_active_owners(self, user):
        return User.objects.filter(is_staff=True, is_superuser=True, is_active=True).exclude(pk=user.pk).exists()

    def perform_update(self, serializer):
        user = serializer.instance
        demoted = serializer.validated_data.get('is_superuser', user.is_superuser) is False
        disabled = serializer.validated_data.get('is_active', user.is_active) is False
        if user == self.request.user and (demoted or disabled):
            raise ValidationError({'error': 'لا يمكنك إيقاف حسابك أو إزالة صلاحية المالك عن نفسك'})
        if user.is_superuser and (demoted or disabled) and not self._other_active_owners(user):
            raise ValidationError({'error': 'يجب أن يبقى مالك واحد نشط على الأقل'})
        serializer.save()

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise ValidationError({'error': 'لا يمكنك حذف حسابك'})
        if instance.is_superuser and not self._other_active_owners(instance):
            raise ValidationError({'error': 'يجب أن يبقى مالك واحد نشط على الأقل'})
        instance.delete()
