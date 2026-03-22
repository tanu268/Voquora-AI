from django.urls import path
from .views import (
    TopicListView, ExerciseListView, ExerciseDetailView, SubmitAnswerView,
    AdminExerciseListCreateView, AdminExerciseDetailView, AdminTopicListCreateView
)

urlpatterns = [
    path('topics/', TopicListView.as_view(), name='topic_list'),
    path('exercises/', ExerciseListView.as_view(), name='exercise_list'),
    path('exercises/<int:pk>/', ExerciseDetailView.as_view(), name='exercise_detail'),
    path('submit/', SubmitAnswerView.as_view(), name='submit_answer'),
    path('admin/exercises/', AdminExerciseListCreateView.as_view(), name='admin_exercise_list'),
    path('admin/exercises/<int:pk>/', AdminExerciseDetailView.as_view(), name='admin_exercise_detail'),
    path('admin/topics/', AdminTopicListCreateView.as_view(), name='admin_topic_list'),
]