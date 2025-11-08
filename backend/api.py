# api.py - Flask API for calendar integration
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import (
    get_upcoming_assignments,
    get_all_events,
    get_unprocessed_assignments
)
from assignment_sync import (
    check_and_sync_for_user,
    send_proactive_reminders
)
from calendar_reader import list_and_store_events
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'Study Companion Calendar API'})

@app.route('/api/calendar/stats', methods=['GET'])
def get_stats():
    """Get quick stats without full sync."""
    try:
        all_events = get_all_events()
        unprocessed = get_unprocessed_assignments()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_events': len(all_events),
                'unprocessed_assignments': len(unprocessed)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/calendar/sync', methods=['POST'])
def sync_calendar():
    """
    Fetch events from Google Calendar and store in MongoDB.
    Body: { "days_ahead": 90 }
    """
    try:
        print("\n" + "="*60)
        print("📅 Calendar Sync Request Received")
        print("="*60)
        
        data = request.json or {}
        days_ahead = data.get('days_ahead', 90)
        
        print(f"📊 Fetching events for next {days_ahead} days...")
        
        success = list_and_store_events(days_ahead)
        
        if success:
            # Get stats
            all_events = get_all_events()
            unprocessed = get_unprocessed_assignments()
            
            print(f"✅ Sync complete!")
            print(f"   Total events: {len(all_events)}")
            print(f"   Unprocessed assignments: {len(unprocessed)}")
            print("="*60 + "\n")
            
            return jsonify({
                'success': True,
                'message': 'Calendar synced successfully',
                'stats': {
                    'total_events': len(all_events),
                    'unprocessed_assignments': len(unprocessed)
                }
            })
        else:
            print("❌ Sync failed")
            print("="*60 + "\n")
            return jsonify({
                'success': False,
                'error': 'Failed to sync calendar'
            }), 500
            
    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ Error in sync_calendar: {error_msg}")
        traceback.print_exc()
        print("="*60 + "\n")
        
        return jsonify({
            'success': False,
            'error': error_msg,
            'hint': 'Check that token.json is in the backend/ folder and MongoDB connection works'
        }), 500

@app.route('/api/calendar/events', methods=['GET'])
def get_events():
    """Get all calendar events from MongoDB."""
    try:
        events = get_all_events()
        
        # Convert ObjectId to string for JSON serialization
        for event in events:
            event['_id'] = str(event['_id'])
        
        return jsonify({
            'success': True,
            'events': events
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/assignments/unprocessed', methods=['GET'])
def get_unprocessed():
    """Get unprocessed assignments from calendar."""
    try:
        assignments = get_unprocessed_assignments()
        
        # Convert ObjectId to string
        for assignment in assignments:
            assignment['_id'] = str(assignment['_id'])
        
        return jsonify({
            'success': True,
            'assignments': assignments,
            'count': len(assignments)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/assignments/sync-to-supabase', methods=['POST'])
def sync_to_supabase():
    """
    Sync unprocessed calendar assignments to Supabase.
    Body: { "user_email": "user@example.com" }
    """
    try:
        data = request.json
        user_email = data.get('user_email')
        
        if not user_email:
            return jsonify({
                'success': False,
                'error': 'user_email is required'
            }), 400
        
        reminders = check_and_sync_for_user(user_email)
        
        return jsonify({
            'success': True,
            'message': 'Assignments synced successfully',
            'reminders': reminders
        })
        
    except Exception as e:
        print(f"Error in sync_to_supabase: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/reminders/check', methods=['POST'])
def check_reminders():
    """
    Check for upcoming assignments and generate reminders.
    Body: { "user_email": "user@example.com", "days_ahead": 7 }
    """
    try:
        data = request.json
        user_email = data.get('user_email')
        days_ahead = data.get('days_ahead', 7)
        
        if not user_email:
            return jsonify({
                'success': False,
                'error': 'user_email is required'
            }), 400
        
        # Get user ID from Supabase
        from assignment_sync import get_supabase_client
        supabase = get_supabase_client()
        result = supabase.table('profiles').select('id').eq('email', user_email).execute()
        
        if not result.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_id = result.data[0]['id']
        
        # Get reminders
        reminders = send_proactive_reminders(user_id, days_ahead)
        
        return jsonify({
            'success': True,
            'reminders': reminders,
            'count': len(reminders)
        })
        
    except Exception as e:
        print(f"Error in check_reminders: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/assignments/upcoming', methods=['GET'])
def get_upcoming():
    """Get upcoming assignments from MongoDB."""
    try:
        days = request.args.get('days', 30, type=int)
        assignments = get_upcoming_assignments(days)
        
        # Convert ObjectId to string
        for assignment in assignments:
            assignment['_id'] = str(assignment['_id'])
        
        return jsonify({
            'success': True,
            'assignments': assignments,
            'count': len(assignments)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Study Companion Calendar API...")
    print("📍 http://localhost:5001")
    print("-" * 60)
    app.run(host='0.0.0.0', port=5001, debug=True)

