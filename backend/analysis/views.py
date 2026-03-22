from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers as drf_serializers
from .utils import analyze_answer, update_weakness_from_errors


class TextAnalysisSerializer(drf_serializers.Serializer):
    text = drf_serializers.CharField()
    reference_text = drf_serializers.CharField(required=False, default='')
    exercise_type = drf_serializers.CharField(required=False, default='error_correction')


class TextAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TextAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = analyze_answer(
            user_answer=data['text'],
            correct_answer=data['reference_text'],
            exercise_type=data['exercise_type'],
        )

        if result['errors']:
            update_weakness_from_errors(request.user, result['errors'])

        return Response(result)


class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from progress.models import Weakness
        from learning.models import Exercise
        from learning.serializers import ExerciseSerializer

        WEAKNESS_TOPIC_MAP = {
            'tense': 'Verb Tenses',
            'article': 'Articles',
            'preposition': 'Prepositions',
            'subject_verb': 'Subject-Verb Agreement',
            'spelling': 'Spelling',
            'vocabulary': 'Vocabulary',
        }

        user_level_difficulty = {
            'beginner': 1, 'elementary': 2, 'intermediate': 3,
            'upper_intermediate': 4, 'advanced': 5
        }.get(request.user.level, 1)

        weaknesses = Weakness.objects.filter(user=request.user).order_by('-frequency')[:3]
        recommended = []

        for weakness in weaknesses:
            topic_name = WEAKNESS_TOPIC_MAP.get(weakness.error_type)
            if topic_name:
                exercises = Exercise.objects.filter(
                    topic__name__icontains=topic_name.split()[0],
                    difficulty__lte=user_level_difficulty + 1,
                    is_active=True
                ).order_by('difficulty')[:3]

                if exercises.exists():
                    recommended.append({
                        'weakness': weakness.get_error_type_display(),
                        'frequency': weakness.frequency,
                        'exercises': ExerciseSerializer(exercises, many=True).data
                    })

        if not recommended:
            exercises = Exercise.objects.filter(
                difficulty=user_level_difficulty,
                is_active=True
            ).order_by('?')[:5]
            recommended.append({
                'weakness': 'General Practice',
                'frequency': 0,
                'exercises': ExerciseSerializer(exercises, many=True).data
            })

        return Response({
            'recommendations': recommended,
            'user_level': request.user.level
        })