from django.shortcuts import render

from rest_framework.generics import CreateAPIView,ListCreateAPIView,DestroyAPIView,RetrieveUpdateDestroyAPIView
from .models import Movie,MovieImage,Genre,Studio
from .serializers import MovieImageSerializer,MovieSerializer,GenreSerializer,StudioSerializer

from rest_framework.parsers import MultiPartParser,FormParser

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .filters import MovieFilter

from rest_framework import permissions
from .pagination import MoviePagination
# Create your views here.


class MovieImageUploadAV(CreateAPIView):
    # queryset=MovieImage.objects.all()
    serializer_class=MovieImageSerializer
    parser_classes=[MultiPartParser,FormParser]

class MovieImageListAv(ListCreateAPIView):
    serializer_class=MovieImageSerializer
    parser_classes=[MultiPartParser,FormParser]
    def get_queryset(self):
        return MovieImage.objects.filter(movie=self.kwargs['movie_pk'])


class MovieImageDetailAV(DestroyAPIView):
    queryset=MovieImage.objects.all()
    serializer_class=MovieImageSerializer
    parser_classes=[MultiPartParser,FormParser]
    def get_queryset(self):
        return MovieImage.objects.filter(movie=self.kwargs['movie_pk'])


class MovieListAV(ListCreateAPIView):
    queryset=Movie.objects.all().order_by('id')
    serializer_class=MovieSerializer
    filter_backends=[DjangoFilterBackend,SearchFilter]
    filterset_class=MovieFilter
    search_fields=['^title','^studio_title']
    pagination_class=MoviePagination
    
class MovieDetailAV(RetrieveUpdateDestroyAPIView):
    queryset=Movie.objects.all()
    serializer_class=MovieSerializer
    permission_classes=[permissions.IsAuthenticatedOrReadOnly]
    
class GenreListAV(ListCreateAPIView):
    queryset=Genre.objects.all()
    serializer_class=GenreSerializer
    
    
class GenreDetailAV(RetrieveUpdateDestroyAPIView):
    queryset=Genre.objects.all()
    serializer_class=GenreSerializer


class StudioListAV(ListCreateAPIView):
    queryset=Studio.objects.all()
    serializer_class=StudioSerializer

class StudioDetailAV(RetrieveUpdateDestroyAPIView):
    queryset=Studio.objects.all()
    serializer_class=StudioSerializer





