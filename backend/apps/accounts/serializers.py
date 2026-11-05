from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser')

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class StaffUserSerializer(serializers.ModelSerializer):
    """Dashboard team members. Every account made here can sign in to the dashboard;
    is_superuser marks an owner, who can also manage the team."""
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'email', 'is_superuser', 'is_active', 'last_login', 'date_joined', 'password')
        read_only_fields = ('last_login', 'date_joined')

    def validate(self, attrs):
        password = attrs.get('password')
        if not self.instance and not password:
            raise serializers.ValidationError({'password': 'كلمة المرور مطلوبة للمستخدم الجديد'})
        if password:
            try:
                validate_password(password, self.instance)
            except DjangoValidationError as e:
                raise serializers.ValidationError({'password': list(e.messages)})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(is_staff=True, **validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', '')
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
