import os
import getpass
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth.models import User

def create_admin():
    username = os.environ.get('ADMIN_USERNAME') or input('Admin username: ').strip()
    password = os.environ.get('ADMIN_PASSWORD') or getpass.getpass('Admin password: ')
    email = os.environ.get('ADMIN_EMAIL', 'admin@faye7.ly')
    if not username or len(password) < 10:
        raise SystemExit('Username is required and the password must be at least 10 characters.')

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser {username}...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Superuser created successfully!")
    else:
        print(f"User {username} already exists. Updating password...")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print("Password updated successfully!")

if __name__ == "__main__":
    create_admin()
