from django.contrib import admin
from .models import Topic, Exercise


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'created_at')
    search_fields = ('name',)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('question', 'topic', 'exercise_type', 'difficulty', 'is_active')
    list_filter = ('topic', 'exercise_type', 'difficulty', 'is_active')
    search_fields = ('question', 'answer')