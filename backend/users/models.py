from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('elementary', 'Elementary'),
        ('intermediate', 'Intermediate'),
        ('upper_intermediate', 'Upper Intermediate'),
        ('advanced', 'Advanced'),
    ]

    email = models.EmailField(unique=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    total_xp = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.email})"