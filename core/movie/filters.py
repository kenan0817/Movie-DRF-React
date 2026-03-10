from django_filters import rest_framework as filters
from .models import Movie

class MovieFilter(filters.FilterSet):
    title=filters.CharFilter(lookup_expr='icontains')
    imdb_min=filters.NumberFilter(field_name='imdb',lookup_expr='gte')
    imdb_max=filters.NumberFilter(field_name='imdb',lookup_expr='lte')
    realese_year=filters.NumberFilter(field_name='realese',lookup_expr='year')
    local=filters.BooleanFilter(field_name='local')
    
    class Meta:
        model=Movie
        fields=['title','genres','studio','local']
