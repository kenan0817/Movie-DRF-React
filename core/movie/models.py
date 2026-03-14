from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Studio(models.Model):
    class Location(models.TextChoices):
        AMERICA = 'america', 'America'
        ASIA = 'asia', 'Asia'
        EUROPE = 'europe', 'Europe'
    
    title=models.CharField(max_length=30)
    location=models.CharField(max_length=20,choices=Location.choices)
    def __str__(self):
        return self.title


class Genre(models.Model):
    title=models.CharField(max_length=30)
    for_kids=models.BooleanField(default=False)
    def __str__(self):
        return self.title

class Movie(models.Model):
    title=models.CharField(max_length=50)
    description=models.TextField()
    genres=models.ManyToManyField(Genre,related_name='movies')
    studio=models.ForeignKey(Studio,on_delete=models.SET_NULL,null=True,blank=True,related_name='movies')
    poster_image=models.ImageField(upload_to='movie_posters/',null=True,blank=True)
    background_image=models.ImageField(upload_to='movie_backgrounds/',null=True,blank=True)
    trailer_url=models.URLField(blank=True,null=True)
    imdb=models.FloatField()
    duration=models.IntegerField()
    local=models.BooleanField(default=False)
    user=models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True)
    relaese=models.DateField()
    updated=models.DateTimeField(auto_now=True)
    created=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title


class MovieImage(models.Model):
    movie=models.ForeignKey(Movie,on_delete=models.CASCADE,related_name='images')
    image=models.ImageField(upload_to='movie_images/')
