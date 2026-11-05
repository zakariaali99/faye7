import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.factories import UserFactory


ACCOUNTS_URL = '/api/accounts/'


@pytest.mark.django_db
class TestLoginView:
    def test_login_succeeds_with_valid_credentials(self, api_client):
        user = UserFactory(username='testuser')
        user.set_password('testpass123')
        user.save()
        response = api_client.post(
            f'{ACCOUNTS_URL}login/',
            {'username': 'testuser', 'password': 'testpass123'},
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['username'] == 'testuser'

    def test_login_fails_with_wrong_password(self, api_client):
        user = UserFactory(username='testuser')
        user.set_password('testpass123')
        user.save()
        response = api_client.post(
            f'{ACCOUNTS_URL}login/',
            {'username': 'testuser', 'password': 'wrongpass'},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_fails_with_missing_fields(self, api_client):
        response = api_client.post(f'{ACCOUNTS_URL}login/', {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserMeView:
    def test_me_returns_current_user_when_authenticated(self, authenticated_client, user):
        response = authenticated_client.get(f'{ACCOUNTS_URL}me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == user.id
        assert response.data['username'] == user.username

    def test_me_returns_401_when_not_authenticated(self, api_client):
        response = api_client.get(f'{ACCOUNTS_URL}me/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefresh:
    def test_token_refresh_returns_new_access_token(self, api_client, user):
        refresh = RefreshToken.for_user(user)
        response = api_client.post(
            f'{ACCOUNTS_URL}token/refresh/',
            {'refresh': str(refresh)},
        )
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_token_refresh_fails_with_invalid_refresh_token(self, api_client):
        response = api_client.post(
            f'{ACCOUNTS_URL}token/refresh/',
            {'refresh': 'invalid-token'},
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


def _client_for(user):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')
    return client


@pytest.mark.django_db
class TestStaffUsers:
    def test_owner_adds_staff_member_who_can_sign_in(self, admin_client, api_client):
        response = admin_client.post(
            f'{ACCOUNTS_URL}users/',
            {'username': 'ahmed', 'first_name': 'أحمد', 'password': 'Faye7-staff-2026'},
            format='json',
        )
        assert response.status_code == status.HTTP_201_CREATED
        ahmed = User.objects.get(username='ahmed')
        assert ahmed.is_staff and not ahmed.is_superuser
        login = api_client.post(f'{ACCOUNTS_URL}login/', {'username': 'ahmed', 'password': 'Faye7-staff-2026'})
        assert login.data['user']['is_staff'] is True

    def test_weak_password_is_rejected(self, admin_client):
        response = admin_client.post(f'{ACCOUNTS_URL}users/', {'username': 'ahmed', 'password': '12345678'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data

    def test_staff_member_cannot_manage_users(self):
        staff = UserFactory(is_staff=True)
        response = _client_for(staff).get(f'{ACCOUNTS_URL}users/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_owner_cannot_delete_or_disable_self(self, admin_client, admin_user):
        assert admin_client.delete(f'{ACCOUNTS_URL}users/{admin_user.id}/').status_code == 400
        assert admin_client.patch(f'{ACCOUNTS_URL}users/{admin_user.id}/', {'is_active': False}, format='json').status_code == 400

    def test_last_owner_cannot_be_demoted(self, admin_client, admin_user):
        other = UserFactory(admin=True)
        other.is_active = False
        other.save()
        response = admin_client.patch(f'{ACCOUNTS_URL}users/{other.id}/', {'is_active': True, 'is_superuser': True}, format='json')
        assert response.status_code == 200
        response = _client_for(other).patch(f'{ACCOUNTS_URL}users/{admin_user.id}/', {'is_superuser': False}, format='json')
        assert response.status_code == 200
        response = _client_for(other).patch(f'{ACCOUNTS_URL}users/{other.id}/', {'is_superuser': False}, format='json')
        assert response.status_code == 400

    def test_disabled_member_is_locked_out(self, admin_client):
        staff = UserFactory(is_staff=True)
        client = _client_for(staff)
        admin_client.patch(f'{ACCOUNTS_URL}users/{staff.id}/', {'is_active': False}, format='json')
        assert client.get(f'{ACCOUNTS_URL}me/').status_code == status.HTTP_401_UNAUTHORIZED
