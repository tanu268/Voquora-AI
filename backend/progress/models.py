from django.db import models
from django.conf import settings


class Progress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    exercise = models.ForeignKey('learning.Exercise', on_delete=models.CASCADE, related_name='attempts')
    user_answer = models.TextField()
    is_correct = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0)
    errors_detected = models.JSONField(default=list, blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'progress'
        ordering = ['-attempted_at']

    def __str__(self):
        status = 'Correct' if self.is_correct else 'Wrong'
        return f"{self.user.username} - {status}"


class Weakness(models.Model):

    ERROR_TYPE_CHOICES = [
        ('tense', 'Verb Tense'),
        ('article', 'Articles (a/an/the)'),
        ('preposition', 'Prepositions'),
        ('subject_verb', 'Subject-Verb Agreement'),
        ('spelling', 'Spelling'),
        ('punctuation', 'Punctuation'),
        ('word_order', 'Word Order'),
        ('vocabulary', 'Vocabulary'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weaknesses')
    error_type = models.CharField(max_length=20, choices=ERROR_TYPE_CHOICES)
    frequency = models.PositiveIntegerField(default=1)
    last_occurred = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weaknesses'
        unique_together = ('user', 'error_type')
        ordering = ['-frequency']

    def __str__(self):
        return f"{self.user.username} - {self.get_error_type_display()} ({self.frequency}x)"