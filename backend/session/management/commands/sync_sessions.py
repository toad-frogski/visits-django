import json
import os
from typing import Any, Dict, List

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandParser
from django.utils.timezone import make_aware
from pymongo import MongoClient

from visits.models import SessionEntry, Session

User = get_user_model()


class Command(BaseCommand):
    help = "Sync historical sessions from mongo db"


    def add_arguments(self, parser: CommandParser):
        parser.add_argument(
            "--users-map",
            type=str,
            required=True,
            default="{}",
            help='Map of users id. Example: "{"1": "username1", "2": "username2", ...}"',
        )

    def handle(self, *args: Any, **options: Any):
        try:
            collection = self.get_mongo_collection()
            historical_users_map = json.loads(options["users_map"])
            current_users_map = self.get_users_dict()
            existing_sessions = self.get_existing_sessions()

            stats = {
                "total": 0,
                "processed": 0,
                "missing_ids": set(),
                "missing_usernames": set()
            }

            for document in collection.find():
                stats["total"] += 1
                if not self.process_document(document, historical_users_map, current_users_map, existing_sessions,stats):
                    continue
                stats["processed"] += 1

            self.stdout.write(f"Processed documents: {stats['processed']} out of {stats['total']}")
        except Exception as e:
            self.stderr.write(f"Error: {str(e)}")
            raise

    def get_mongo_collection(self):
        client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
        db = client[os.getenv("MONGO_DB", "visits")]
        return db[os.getenv("MONGO_COLLECTION", "sessions")]

    def get_users_dict(self) -> Dict[str, Any]:
        User = get_user_model()
        return {user.username: user for user in User.objects.all()}

    def get_existing_sessions(self) -> Dict[str, set]:
        sessions = Session.objects.all().values("user__username", "date")
        existing = {}
        for session in sessions:
            existing.setdefault(session["user__username"], []).append(session["date"])
        return existing

    def process_document(
            self,
            document: Dict,
            legacy_map: Dict[str, str],
            user_map: Dict[str, Any],
            existing_sessions: Dict[str, set],
            stats: Dict,
    ) -> bool:
        user_id = str(document.get("userId"))
        username = legacy_map.get(user_id)

        if not username:
            if user_id not in stats["missing_ids"]:
                self.stdout.write(f"User ID not found in historical map: {user_id}")
                stats["missing_ids"].add(user_id)
            return False

        user = user_map.get(username)
        if not user:
            if username not in stats["missing_usernames"]:
                self.stdout.write(f"Username not found in current users: {username}")
                stats["missing_usernames"].add(username)
            return False

        if username in existing_sessions and document["date"] in existing_sessions[username]:
            return True  # session already exists

        enter = document.get("enter")
        exit = document.get("exit")
        leaves = document.get("leaves", [])

        if not enter:
            self.stdout.write(f"Missing 'enter' for {username} on {document['date']}")
            return False
        if not exit:
            self.stdout.write(f"Missing 'exit' for {username} on {document['date']}")
            return False

        session = Session(user=user, date=document["date"])
        entries = self.create_entries(session, enter, exit, leaves, username, document["date"])

        if not entries:
            return False

        session.save()
        SessionEntry.objects.bulk_create(entries)
        return True

    def create_entries(
            self,
            session: Session,
            enter: Dict,
            exit: Dict,
            leaves: List[Dict],
            username: str,
            date: str
    ) -> List[SessionEntry]:

        entries = []

        if not leaves:
            return [SessionEntry(
                session=session,
                type=SessionEntry.SessionEntryType.WORK,
                start=make_aware(enter["enterTime"]),
                end=make_aware(exit["exitTime"]),
                comment=enter.get("comment"),
            )]

        last_time = enter["enterTime"]
        for leave in leaves:
            if not all(k in leave for k in ("leaveTime", "comeBackTime", "leaveReason")):
                self.stdout.write(f"Incomplete leave entry for {username} on {date}")
                return []

            entries.append(SessionEntry(
                session=session,
                type=SessionEntry.SessionEntryType.WORK,
                start=make_aware(last_time),
                end=make_aware(leave["leaveTime"])
            ))

            leave_type = (
                SessionEntry.SessionEntryType.LUNCH
                if leave["leaveReason"] == "lunch"
                else SessionEntry.SessionEntryType.BREAK
            )

            entries.append(SessionEntry(
                session=session,
                type=leave_type,
                start=make_aware(leave["leaveTime"]),
                end=make_aware(leave["comeBackTime"]),
                comment=leave.get("comment")
            ))

            last_time = leave["comeBackTime"]

        entries.append(SessionEntry(
            session=session,
            type=SessionEntry.SessionEntryType.WORK,
            start=make_aware(last_time),
            end=make_aware(exit["exitTime"]),
            comment=exit.get("comment"),
        ))

        return entries
