from typing import TypeVar
from django.db import models

T = TypeVar("T", bound=models.Model)

class RedmineManager(models.Manager[T]):
    def get_queryset(self):
        return super().get_queryset().using("redmine")


class RedmineTimeEntry(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    project_id = models.IntegerField()
    issue_id = models.IntegerField(null=True, blank=True)
    hours = models.DecimalField(max_digits=10, decimal_places=7)
    spent_on = models.DateField()
    comments = models.TextField(blank=True, null=True)

    objects: RedmineManager["RedmineTimeEntry"] = RedmineManager()

    class Meta:
        managed = False
        db_table = "time_entries"
        app_label = "redmine"


class RedmineUser(models.Model):
    id = models.AutoField(primary_key=True)
    login = models.CharField(max_length=255)

    objects: RedmineManager["RedmineUser"] = RedmineManager()

    class Meta:
        managed = False
        db_table = "users"
        app_label = "redmine"
