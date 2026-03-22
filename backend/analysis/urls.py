from django.urls import path
from .views import TextAnalysisView, RecommendationView

urlpatterns = [
    path('analyze/', TextAnalysisView.as_view(), name='text_analysis'),
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),
]