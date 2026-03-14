from django.contrib import admin
from django.utils.html import format_html
from .models import Movie,MovieImage,Studio,Genre


class MovieImageInline(admin.TabularInline):
    model=MovieImage
    extra=1


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display=('title','studio','imdb','updated')
    list_filter=('studio','genres','local')
    search_fields=('title','studio__title')
    filter_horizontal=('genres',)
    inlines=[MovieImageInline]
    readonly_fields=('poster_preview','background_preview')
    fieldsets=(
        ('Main Info', {
            'fields': ('title','description','studio','genres','imdb','duration','relaese','local','user')
        }),
        ('Cover Images', {
            'fields': ('poster_image','poster_preview','background_image','background_preview','trailer_url')
        }),
    )

    def poster_preview(self,obj):
        if not obj.poster_image:
            return 'No poster'
        return format_html('<img src="{}" style="width:90px;height:130px;object-fit:cover;border-radius:8px;" />', obj.poster_image.url)

    poster_preview.short_description='Poster Preview'

    def background_preview(self,obj):
        if not obj.background_image:
            return 'No background'
        return format_html('<img src="{}" style="width:180px;height:100px;object-fit:cover;border-radius:8px;" />', obj.background_image.url)

    background_preview.short_description='Background Preview'


@admin.register(MovieImage)
class MovieImageAdmin(admin.ModelAdmin):
    list_display=('id','movie','image_preview')
    search_fields=('movie__title',)
    readonly_fields=('image_preview',)

    def image_preview(self,obj):
        if not obj.image:
            return 'No image'
        return format_html('<img src="{}" style="width:160px;height:90px;object-fit:cover;border-radius:8px;" />', obj.image.url)

    image_preview.short_description='Preview'


@admin.register(Studio)
class StudioAdmin(admin.ModelAdmin):
    list_display=('title','location')
    search_fields=('title',)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display=('title','for_kids')
    search_fields=('title',)
