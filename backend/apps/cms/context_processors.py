from .models import StoreSettings


def store_theme(request):
    """Puts the active storefront theme into index.html, so the page arrives already themed."""
    theme = StoreSettings.objects.filter(pk=1).values_list('store_theme', flat=True).first()
    return {'store_theme': theme or 'dawn'}
