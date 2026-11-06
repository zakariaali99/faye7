from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
from django.http import FileResponse, Http404
import os


def site_icon(request):
    # Browsers ask for /favicon.ico on their own; answer with the bottle icon.
    icon = os.path.join(settings.BASE_DIR, 'static', 'frontend', 'logo.png')
    if not os.path.exists(icon):
        raise Http404
    return FileResponse(open(icon, 'rb'), content_type='image/png')


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/cart/", include("cart.urls")),
    path("api/crm/", include("crm.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/cms/", include("cms.urls")),
    path("api/marketing/", include("marketing.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/backups/", include("backups.urls")),
    re_path(r'^(?:favicon\.ico|logo\.png)$', site_icon),
]

# Explicit media serving route (works in all environments regardless of DEBUG setting)
urlpatterns += [
    re_path(r'^media/(?!backups/)(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# SPA catch-all — serve index.html for all non-API, non-admin, non-static, non-media routes
urlpatterns += [
    re_path(r'^(?!api/|admin/|static/|media/|logo\.png|favicon\.ico).*$',
            TemplateView.as_view(template_name='index.html'))
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

