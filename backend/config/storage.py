import os
import unicodedata
import uuid

from django.core.files.storage import FileSystemStorage
from django.utils.text import get_valid_filename


def ascii_filename(name):
    """Return an ASCII-only file name: accents are dropped (é -> e), and a name with
    no Latin letters left (e.g. Arabic) gets a short random stem. The host can't
    serve media whose names contain non-ASCII characters."""
    stem, ext = os.path.splitext(os.path.basename(name))
    stem = unicodedata.normalize('NFKD', stem).encode('ascii', 'ignore').decode()
    ext = unicodedata.normalize('NFKD', ext).encode('ascii', 'ignore').decode().lower()
    stem = get_valid_filename(stem).strip('._-') if stem.strip() else ''
    if not stem:
        stem = uuid.uuid4().hex[:10]
    return f'{stem}{ext}'


class AsciiFileSystemStorage(FileSystemStorage):
    def get_valid_name(self, name):
        return ascii_filename(name)
