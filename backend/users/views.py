from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Sum
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from progress.models import Progress, Weakness
from learning.models import Exercise, Topic


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful.',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful.',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logout successful.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── Admin Views ──────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(is_staff=False).order_by('-created_at')


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.filter(is_staff=False).count()
        total_exercises = Exercise.objects.filter(is_active=True).count()
        total_attempts = Progress.objects.count()
        correct_attempts = Progress.objects.filter(is_correct=True).count()
        accuracy = round((correct_attempts / total_attempts * 100), 2) if total_attempts else 0

        top_users = User.objects.filter(is_staff=False).order_by('-total_xp')[:5]
        top_weaknesses = (
            Weakness.objects.values('error_type')
            .annotate(total=Sum('frequency'))
            .order_by('-total')[:5]
        )

        return Response({
            'total_users': total_users,
            'total_exercises': total_exercises,
            'total_attempts': total_attempts,
            'correct_attempts': correct_attempts,
            'accuracy_percent': accuracy,
            'top_users': UserProfileSerializer(top_users, many=True).data,
            'top_weaknesses': list(top_weaknesses),
        })


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk, is_staff=False)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        progress = Progress.objects.filter(user=user)
        total = progress.count()
        correct = progress.filter(is_correct=True).count()
        weaknesses = Weakness.objects.filter(user=user)

        return Response({
            'user': UserProfileSerializer(user).data,
            'total_attempts': total,
            'correct_answers': correct,
            'accuracy_percent': round((correct / total * 100), 2) if total else 0,
            'weaknesses': [
                {'error_type': w.error_type, 'frequency': w.frequency}
                for w in weaknesses
            ],
        })

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk, is_staff=False)
            user.delete()
            return Response({'message': 'User deleted.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)