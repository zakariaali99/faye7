from django.db import migrations
from django.db.models import F


def add_payment_notice(apps, schema_editor):
    HomePageSection = apps.get_model('cms', 'HomePageSection')
    if HomePageSection.objects.filter(key='payment_notice').exists():
        return
    HomePageSection.objects.update(order=F('order') + 1)
    HomePageSection.objects.create(
        key='payment_notice',
        title_ar='رسالة طريقة الدفع',
        content={'heading': 'الدفع بالتحويل عند تأكيد الطلب', 'description': 'بعد تأكيد طلبك نرسل لك بيانات التحويل على الواتساب.'},
        is_active=True,
        order=0,
    )


def remove_payment_notice(apps, schema_editor):
    apps.get_model('cms', 'HomePageSection').objects.filter(key='payment_notice').delete()


class Migration(migrations.Migration):
    dependencies = [('cms', '0012_alter_heroslide_button_link_and_more')]
    operations = [migrations.RunPython(add_payment_notice, remove_payment_notice)]
