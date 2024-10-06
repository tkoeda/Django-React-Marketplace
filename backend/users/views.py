from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, generics
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer


User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """
        Allow anyone to create a user (register).
        """
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
