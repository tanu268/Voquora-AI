from rest_framework import serializers
from .models import Topic, Exercise


class TopicSerializer(serializers.ModelSerializer):
    exercise_count = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ('id', 'name', 'description', 'icon', 'order', 'exercise_count')

    def get_exercise_count(self, obj):
        return obj.exercises.filter(is_active=True).count()


class ExerciseSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    difficulty_label = serializers.CharField(source='get_difficulty_display', read_only=True)
    exercise_type_label = serializers.CharField(source='get_exercise_type_display', read_only=True)

    class Meta:
        model = Exercise
        fields = (
            'id', 'topic', 'topic_name', 'exercise_type', 'exercise_type_label',
            'question', 'answer', 'options', 'explanation',
            'difficulty', 'difficulty_label', 'xp_reward', 'created_at'
        )


class ExerciseSubmitSerializer(serializers.Serializer):
    exercise_id = serializers.IntegerField()
    user_answer = serializers.CharField()

    def validate_exercise_id(self, value):
        if not Exercise.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Exercise not found.')
        return value