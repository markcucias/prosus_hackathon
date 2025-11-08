# database.py - MongoDB Connection for Calendar Events
from pymongo import MongoClient
from datetime import datetime, timedelta
import re

def get_database():
    """Connect to MongoDB Atlas."""
    CONNECTION_STRING = "mongodb+srv://prosus-db-user:yLFIMGwT48qUKxDG@prosus-db-user.wfei3mu.mongodb.net/?retryWrites=true&w=majority"
    client = MongoClient(
        CONNECTION_STRING,
        serverSelectionTimeoutMS=5000,  # 5 second timeout
        connectTimeoutMS=5000,
        socketTimeoutMS=5000
    )
    return client["study_companion"]

def insert_event(data):
    """Insert one event document into MongoDB."""
    db = get_database()
    collection = db["calendar_events"]
    # Avoid duplicates based on event text and datetime
    existing = collection.find_one({
        "details": data["details"], 
        "datetime": data["datetime"]
    })
    
    if not existing:
        # Add metadata
        data['created_at'] = datetime.utcnow()
        data['is_assignment'] = detect_if_assignment(data['details'])
        data['processed'] = False
        
        result = collection.insert_one(data)
        print(f"✅ Inserted event with id: {result.inserted_id}")
        return result.inserted_id
    else:
        print(f"⚠️ Event already exists in database: {data['details']}")
        return existing['_id']

def detect_if_assignment(event_title):
    """
    Detect if calendar event is an assignment/exam using keywords.
    Returns: boolean
    """
    assignment_keywords = [
        'exam', 'test', 'quiz', 'midterm', 'final',
        'assignment', 'homework', 'project', 'presentation',
        'essay', 'paper', 'due', 'deadline', 'submit'
    ]
    
    title_lower = event_title.lower()
    return any(keyword in title_lower for keyword in assignment_keywords)

def get_unprocessed_assignments():
    """
    Get calendar events that are assignments but haven't been processed yet.
    Returns: list of assignment events
    """
    db = get_database()
    collection = db["calendar_events"]
    
    # Find events that are assignments and not yet processed
    assignments = collection.find({
        'is_assignment': True,
        'processed': False
    }).sort('datetime', 1)  # Sort by date ascending
    
    return list(assignments)

def get_upcoming_assignments(days_ahead=7):
    """
    Get assignments happening within X days.
    Used for proactive reminders.
    """
    db = get_database()
    collection = db["calendar_events"]
    
    now = datetime.utcnow()
    future_date = now + timedelta(days=days_ahead)
    
    # Find assignments in the next X days that need reminders
    assignments = collection.find({
        'is_assignment': True,
        'datetime': {
            '$gte': now.isoformat(),
            '$lte': future_date.isoformat()
        },
        'reminder_sent': {'$ne': True}
    }).sort('datetime', 1)
    
    return list(assignments)

def mark_assignment_processed(event_id):
    """Mark an assignment as processed after creating study plan."""
    db = get_database()
    collection = db["calendar_events"]
    
    collection.update_one(
        {'_id': event_id},
        {'$set': {'processed': True, 'processed_at': datetime.utcnow()}}
    )
    print(f"✅ Marked event {event_id} as processed")

def mark_reminder_sent(event_id):
    """Mark that reminder was sent for this assignment."""
    db = get_database()
    collection = db["calendar_events"]
    
    collection.update_one(
        {'_id': event_id},
        {'$set': {'reminder_sent': True, 'reminder_sent_at': datetime.utcnow()}}
    )
    print(f"📧 Marked reminder sent for event {event_id}")

def extract_assignment_info(event_title, event_datetime):
    """
    Extract useful information from calendar event.
    Returns: dict with assignment details
    """
    title_lower = event_title.lower()
    
    # Detect assignment type
    assignment_type = 'exam'  # default
    if any(word in title_lower for word in ['essay', 'paper']):
        assignment_type = 'essay'
    elif any(word in title_lower for word in ['presentation', 'present']):
        assignment_type = 'presentation'
    elif 'quiz' in title_lower:
        assignment_type = 'quiz'
    
    # Detect exam subtype (for exams)
    exam_subtype = 'hybrid'
    if 'theoretical' in title_lower or 'theory' in title_lower:
        exam_subtype = 'theoretical'
    elif 'practical' in title_lower or 'lab' in title_lower:
        exam_subtype = 'practical'
    
    # Try to extract course name (often at start of title)
    # Example: "Machine Learning Exam" -> course = "Machine Learning"
    course_name = event_title
    for keyword in ['exam', 'test', 'quiz', 'final', 'midterm', 'assignment']:
        if keyword in title_lower:
            course_name = event_title.split(keyword)[0].strip()
            break
    
    return {
        'title': event_title,
        'course_name': course_name,
        'type': assignment_type,
        'exam_subtype': exam_subtype,
        'due_date': event_datetime
    }

def get_all_events():
    """Get all calendar events for debugging."""
    db = get_database()
    collection = db["calendar_events"]
    return list(collection.find().sort('datetime', 1))

if __name__ == '__main__':
    # Test connection
    try:
        db = get_database()
        print("✅ Connected to MongoDB successfully!")
        
        # Show stats
        events_count = db["calendar_events"].count_documents({})
        assignments_count = db["calendar_events"].count_documents({'is_assignment': True})
        print(f"📊 Total events: {events_count}")
        print(f"📚 Assignments detected: {assignments_count}")
        
        # Show upcoming assignments
        upcoming = get_upcoming_assignments(30)
        print(f"\n📅 Upcoming assignments in next 30 days:")
        for assignment in upcoming:
            print(f"  - {assignment['details']} ({assignment['datetime']})")
            
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")

