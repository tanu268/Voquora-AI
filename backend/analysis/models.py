from django.db import models
from django.conf import settings


class TextAnalysisLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='analysis_logs')
    input_text = models.TextField()
    corrected_text = models.TextField(blank=True)
    errors_found = models.JSONField(default=list)
    similarity_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analysis_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.created_at:%Y-%m-%d %H:%M}"