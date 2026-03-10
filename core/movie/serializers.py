from rest_framework import serializers
from .models import Studio,Genre,Movie,MovieImage

class MovieImageSerializer(serializers.ModelSerializer):
    class Meta:
        model=MovieImage
        fields='__all__'

class StudioSerializer(serializers.ModelSerializer):
    class Meta:
        model=Studio
        fields='__all__'

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model=Genre
        fields='__all__'


class MovieSerializer(serializers.ModelSerializer):
    studio=StudioSerializer(read_only=True)
    genres=GenreSerializer(many=True,read_only=True)
    studio_id=serializers.PrimaryKeyRelatedField(queryset=Studio.objects.all(),source='studio',write_only=True,required=False,allow_null=True,)
    genre_ids=serializers.PrimaryKeyRelatedField(queryset=Genre.objects.all(),source='genres',many=True,write_only=True,)
    movie_images=MovieImageSerializer(many=True,read_only=True,source='images',)
    class Meta:
        model=Movie
        fields=['id','title','description','studio','studio_id','genres','genre_ids','imdb','duration','local','user','relaese','created','updated','movie_images']
