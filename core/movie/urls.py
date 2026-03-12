from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('movie-list/', views.MovieListAV.as_view(), name='movie-list'),
    path('movie-list/<int:pk>/', views.MovieDetailAV.as_view(), name='movie-detail'),

    path('genre-list/', views.GenreListAV.as_view(), name='genre-list'),
    path('genre-list/<int:pk>/', views.GenreDetailAV.as_view(), name='genre-detail'),

    path('studio-list/', views.StudioListAV.as_view(), name='studio-list'),
    path('studio-list/<int:pk>/', views.StudioDetailAV.as_view(), name='studio-detail'),

    path('movie-list/<int:movie_pk>/images/', views.MovieImageListAv.as_view(), name='movie-image-list'),
    path('movie-list/<int:movie_pk>/images/<int:pk>/', views.MovieImageDetailAV.as_view(), name='movie-image-detail'),
    path('movie-image-upload/', views.MovieImageUploadAV.as_view(), name='movie-image-upload'),
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
