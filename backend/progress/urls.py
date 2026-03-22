from django.urls import path
from .views import ProgressHistoryView, WeaknessListView, ProgressSummaryView

urlpatterns = [
    path('history/', ProgressHistoryView.as_view(), name='progress_history'),
    path('weaknesses/', WeaknessListView.as_view(), name='weakness_list'),
    path('summary/', ProgressSummaryView.as_view(), name='progress_summary'),
]