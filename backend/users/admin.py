from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'level', 'total_xp', 'is_active')
    list_filter = ('level', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Learning Profile', {'fields': ('level', 'bio', 'avatar', 'total_xp', 'streak_days')}),
    )
    search_fields = ('username', 'email')