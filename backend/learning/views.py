from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from .models import Topic, Exercise
from .serializers import TopicSerializer, ExerciseSerializer, ExerciseSubmitSerializer
from progress.models import Progress, Weakness


class TopicListView(generics.ListAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]


class ExerciseListView(generics.ListAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Exercise.objects.filter(is_active=True).select_related('topic')
        topic_id = self.request.query_params.get('topic')
        difficulty = self.request.query_params.get('difficulty')
        exercise_type = self.request.query_params.get('type')
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        if exercise_type:
            qs = qs.filter(exercise_type=exercise_type)
        return qs


class ExerciseDetailView(generics.RetrieveAPIView):
    queryset = Exercise.objects.filter(is_active=True)
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]


class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ExerciseSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        exercise = get_object_or_404(Exercise, id=serializer.validated_data['exercise_id'])
        user_answer = serializer.validated_data['user_answer'].strip()
        correct_answer = exercise.answer.strip()
        is_correct = user_answer.lower() == correct_answer.lower()
        score = exercise.xp_reward if is_correct else 0

        # Run AI analysis
        from analysis.utils import analyze_answer, update_weakness_from_errors
        analysis = analyze_answer(user_answer, correct_answer, exercise.exercise_type)
        is_correct = is_correct or analysis.get('is_correct', False)

        # Save progress
        Progress.objects.create(
            user=request.user,
            exercise=exercise,
            user_answer=user_answer,
            is_correct=is_correct,
            score=score,
            errors_detected=analysis.get('errors', []),
        )

        # Update weakness tracking
        if not is_correct and analysis.get('errors'):
            update_weakness_from_errors(request.user, analysis['errors'])

        # Update user XP
        if is_correct:
            request.user.total_xp += score
            request.user.save(update_fields=['total_xp'])

        return Response({
            'is_correct': is_correct,
            'correct_answer': correct_answer,
            'explanation': exercise.explanation,
            'score': score,
            'feedback': analysis.get('feedback', ''),
        })




# ─── Admin Exercise Management ────────────────────────────────────────────────

class AdminExerciseListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        exercises = Exercise.objects.all().select_related('topic')
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminExerciseDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        exercise = get_object_or_404(Exercise, pk=pk)
        return Response(ExerciseSerializer(exercise).data)

    def put(self, request, pk):
        exercise = get_object_or_404(Exercise, pk=pk)
        serializer = ExerciseSerializer(exercise, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        exercise = get_object_or_404(Exercise, pk=pk)
        exercise.delete()
        return Response({'message': 'Exercise deleted.'}, status=status.HTTP_204_NO_CONTENT)


class AdminTopicListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        topics = Topic.objects.all()
        return Response(TopicSerializer(topics, many=True).data)

    def post(self, request):
        serializer = TopicSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)