from django.db import migrations


def mark_niche(apps, schema_editor):
    # Niche perfumes come first on the products page. The flag can be changed later from the dashboard.
    Category = apps.get_model('products', 'Category')
    Category.objects.filter(slug__icontains='niche').update(show_first=True)


class Migration(migrations.Migration):
    dependencies = [('products', '0015_category_show_first_product_show_price_in_list_and_more')]
    operations = [migrations.RunPython(mark_niche, migrations.RunPython.noop)]
