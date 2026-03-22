from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import Progress, Weakness
from .serializers import ProgressSerializer, WeaknessSerializer, ProgressSummarySerializer


class ProgressHistoryView(generics.ListAPIView):
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Progress.objects.filter(user=self.request.user).select_related(
            'exercise', 'exercise__topic'
        )


class WeaknessListView(generics.ListAPIView):
    serializer_class = WeaknessSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Weakness.objects.filter(user=self.request.user)


class ProgressSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Progress.objects.filter(user=user)
        total = qs.count()
        correct = qs.filter(is_correct=True).count()
        total_score = qs.aggregate(s=Sum('score'))['s'] or 0
        topics = list(
            qs.values_list('exercise__topic__name', flat=True).distinct()
        )
        weaknesses = Weakness.objects.filter(user=user)[:5]

        data = {
            'total_attempts': total,
            'correct_answers': correct,
            'accuracy_percent': round((correct / total * 100), 2) if total else 0.0,
            'total_score': total_score,
            'topics_practiced': [t for t in topics if t],
            'top_weaknesses': weaknesses,
        }
        serializer = ProgressSummarySerializer(data)
        return Response(serializer.data)