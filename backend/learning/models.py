from django.db import models


class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'topics'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Exercise(models.Model):

    TYPE_CHOICES = [
        ('mcq', 'Multiple Choice'),
        ('fill_blank', 'Fill in the Blank'),
        ('error_correction', 'Error Correction'),
        ('sentence_rewrite', 'Sentence Rewrite'),
    ]

    DIFFICULTY_CHOICES = [
        (1, 'Beginner'),
        (2, 'Elementary'),
        (3, 'Intermediate'),
        (4, 'Upper Intermediate'),
        (5, 'Advanced'),
    ]

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='exercises')
    exercise_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='mcq')
    question = models.TextField()
    answer = models.TextField()
    options = models.JSONField(null=True, blank=True)
    explanation = models.TextField(blank=True)
    difficulty = models.PositiveSmallIntegerField(choices=DIFFICULTY_CHOICES, default=1)
    xp_reward = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exercises'
        ordering = ['difficulty', 'topic']

    def __str__(self):
        return f"[{self.get_exercise_type_display()}] {self.question[:60]}"