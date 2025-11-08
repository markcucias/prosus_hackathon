# database.py
from pymongo import MongoClient

def get_database():
    """Connect to local MongoDB (or change URI for Atlas)."""
    CONNECTION_STRING = "mongodb+srv://prosus-db-user:yLFIMGwT48qUKxDG@prosus-db-user.wfei3mu.mongodb.net/?retryWrites=true&w=majority"
    client = MongoClient(CONNECTION_STRING)
    return client["study_companion"]

def insert_event(data):
    """Insert one event document into MongoDB."""
    db = get_database()
    collection = db["calendar_events"]
    # Avoid duplicates based on event text and datetime
    if not collection.find_one({"details": data["details"], "datetime": data["datetime"]}):
        result = collection.insert_one(data)
        print(f"✅ Inserted event with id: {result.inserted_id}")
    else:
        print(f"⚠️ Event already exists in database: {data['details']}")
