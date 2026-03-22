from rest_framework import serializers
from .models import Progress, Weakness


class ProgressSerializer(serializers.ModelSerializer):
    exercise_question = serializers.CharField(source='exercise.question', read_only=True)
    topic_name = serializers.CharField(source='exercise.topic.name', read_only=True)
    difficulty = serializers.IntegerField(source='exercise.difficulty', read_only=True)

    class Meta:
        model = Progress
        fields = (
            'id', 'exercise', 'exercise_question', 'topic_name',
            'difficulty', 'user_answer', 'is_correct', 'score',
            'errors_detected', 'attempted_at'
        )
        read_only_fields = fields


class WeaknessSerializer(serializers.ModelSerializer):
    error_type_label = serializers.CharField(source='get_error_type_display', read_only=True)

    class Meta:
        model = Weakness
        fields = ('id', 'error_type', 'error_type_label', 'frequency', 'last_occurred')
        read_only_fields = fields


class ProgressSummarySerializer(serializers.Serializer):
    total_attempts = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    accuracy_percent = serializers.FloatField()
    total_score = serializers.IntegerField()
    topics_practiced = serializers.ListField(child=serializers.CharField())
    top_weaknesses = WeaknessSerializer(many=True)