# email_service.py - Proactive Email Notifications
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def send_exam_reminder(user_email, exam_details, days_until_exam):
    """
    Send proactive email reminder about upcoming exam.
    
    Args:
        user_email: User's email address
        exam_details: Dict with exam info (title, date, course)
        days_until_exam: Number of days until the exam
    """
    
    # Email configuration from environment variables
    # Load .env file explicitly
    from dotenv import load_dotenv
    import os as os_module
    env_path = os_module.path.join(os_module.path.dirname(__file__), '.env')
    load_dotenv(env_path)
    
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD', '').strip().replace(' ', '')  # Remove spaces from app password
    
    # Debug: Check if password is loaded (show first 2 chars for verification)
    print(f"🔍 [EMAIL] Checking credentials...")
    print(f"   SENDER_EMAIL: {sender_email}")
    print(f"   SENDER_PASSWORD loaded: {'Yes' if sender_password else 'No'} (length: {len(sender_password)})")
    if sender_password:
        print(f"   Password preview: {sender_password[:2]}...{sender_password[-2:]}")
    
    if not sender_email or not sender_password:
        print("❌ Email credentials not configured properly!")
        print(f"   SENDER_EMAIL: {sender_email or 'NOT SET'}")
        print(f"   SENDER_PASSWORD: {'NOT SET' if not sender_password else 'SET (but empty)'}")
        print(f"   📝 Make sure backend/.env file exists with:")
        print(f"      SENDER_EMAIL={sender_email or 'your.email@gmail.com'}")
        print(f"      SENDER_PASSWORD=qcokkdvzyhskelwo")
        return False
    
    # Create email message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"📚 Exam Alert: {exam_details['title']} in {days_until_exam} days!"
    msg['From'] = f"Study Companion AI <{sender_email}>"
    msg['To'] = user_email
    
    # Email body (plain text)
    text_body = f"""
Hi there! 👋

I noticed you have an exam coming up soon:

📚 Exam: {exam_details['title']}
📅 Date: {exam_details['date']}
⏰ Time until exam: {days_until_exam} days

I'm ready to help you prepare! To create a personalized study plan, I need some materials:

🔹 Lecture slides
🔹 Course instructions
🔹 Practice problems or past exams
🔹 Any other relevant study materials

Please log in to your Study Companion dashboard and upload these materials so I can:
✅ Generate personalized practice questions
✅ Create an optimized study schedule
✅ Track your progress and adapt difficulty

👉 Log in here: http://localhost:8080

Let's ace this exam together! 🚀

Best,
Your Study Companion AI

---
This is an automated reminder from your Study Companion AI system.
"""
    
    # Email body (HTML for better formatting)
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
        .content {{ background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .exam-card {{ background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }}
        .action-button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
        .checklist {{ background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .checklist-item {{ padding: 8px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Exam Alert!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Your AI Study Companion is ready to help</p>
        </div>
        <div class="content">
            <p>Hi there! 👋</p>
            
            <p>I noticed you have an exam coming up soon:</p>
            
            <div class="exam-card">
                <h2 style="margin: 0 0 10px 0; color: #667eea;">📚 {exam_details['title']}</h2>
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> {exam_details['date']}</p>
                <p style="margin: 5px 0;"><strong>⏰ Time until exam:</strong> <span style="color: #e74c3c; font-weight: bold;">{days_until_exam} days</span></p>
            </div>
            
            <p><strong>I'm ready to help you prepare!</strong> To create a personalized study plan, I need some materials:</p>
            
            <div class="checklist">
                <div class="checklist-item">🔹 Lecture slides</div>
                <div class="checklist-item">🔹 Course instructions</div>
                <div class="checklist-item">🔹 Practice problems or past exams</div>
                <div class="checklist-item">🔹 Any other relevant study materials</div>
            </div>
            
            <p>Once you upload these, I can:</p>
            <ul>
                <li>✅ Generate personalized practice questions</li>
                <li>✅ Create an optimized study schedule</li>
                <li>✅ Track your progress and adapt difficulty</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="http://localhost:8080" class="action-button">📖 Log In & Upload Materials</a>
            </div>
            
            <p style="margin-top: 30px; text-align: center; color: #667eea; font-weight: bold;">Let's ace this exam together! 🚀</p>
            
            <p style="text-align: center; margin-top: 20px;">Best,<br><strong>Your Study Companion AI</strong></p>
        </div>
        <div class="footer">
            This is an automated reminder from your Study Companion AI system.<br>
            To stop receiving these notifications, adjust your settings in the dashboard.
        </div>
    </div>
</body>
</html>
"""
    
    # Attach both plain text and HTML versions
    part1 = MIMEText(text_body, 'plain')
    part2 = MIMEText(html_body, 'html')
    msg.attach(part1)
    msg.attach(part2)
    
    # Send email
    try:
        print(f"📧 Sending exam reminder to {user_email}...")
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        
        print(f"✅ Email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return False


def send_test_email(user_email):
    """Send a test email to verify SMTP configuration."""
    
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD')
    
    if not sender_email or not sender_password:
        return False, "Email credentials not configured"
    
    msg = MIMEText("Your Study Companion AI is now active and monitoring your calendar! 🚀")
    msg['Subject'] = "✅ Study Companion AI - Email Notifications Enabled"
    msg['From'] = sender_email
    msg['To'] = user_email
    
    try:
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        
        return True, "Test email sent successfully"
    except Exception as e:
        return False, str(e)

