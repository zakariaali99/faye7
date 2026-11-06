import os

from django.apps import apps
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand
from django.db import models

from config.storage import ascii_filename


class Command(BaseCommand):
    help = 'Rename media files with non-ASCII names (Arabic, accents) and update the rows that use them.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would change without touching anything')

    def handle(self, *args, dry_run=False, **kwargs):
        renamed = {}  # old relative path -> new relative path (one file can be used by several rows)
        rows = 0
        missing = []

        for model in apps.get_models():
            for field in model._meta.get_fields():
                if not isinstance(field, models.FileField) or field.storage is not default_storage:
                    continue
                for obj in model.objects.exclude(**{field.name: ''}).exclude(**{f'{field.name}__isnull': True}):
                    old = getattr(obj, field.name).name
                    if old.isascii():
                        continue
                    if old not in renamed:
                        if not default_storage.exists(old):
                            missing.append(old)
                            continue
                        folder = os.path.dirname(old)
                        new = default_storage.get_available_name(os.path.join(folder, ascii_filename(old)))
                        if not dry_run:
                            os.rename(default_storage.path(old), default_storage.path(new))
                        renamed[old] = new
                        self.stdout.write(f'{old} -> {renamed[old]}')
                    if not dry_run:
                        model.objects.filter(pk=obj.pk).update(**{field.name: renamed[old]})
                    rows += 1

        for old in missing:
            self.stdout.write(self.style.WARNING(f'missing on disk, left as is: {old}'))
        prefix = '[dry run] ' if dry_run else ''
        self.stdout.write(self.style.SUCCESS(f'{prefix}{len(renamed)} files renamed, {rows} rows updated.'))
