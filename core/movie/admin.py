from django.contrib import admin
from .models import Movie,MovieImage,Studio,Genre
# Register your models here.
admin.site.register(Movie)
admin.site.register(MovieImage)
admin.site.register(Studio)
admin.site.register(Genre)
