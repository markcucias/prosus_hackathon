#!/usr/bin/env python3
"""
Helper script to set up .env file with email credentials.
"""
import os
from pathlib import Path

def setup_env():
    """Create or update .env file with email credentials."""
    env_path = Path(__file__).parent / '.env'
    env_example_path = Path(__file__).parent / 'env.example'
    
    print("="*60)
    print("🔧 Setting up backend/.env file")
    print("="*60)
    
    # Read example file
    if env_example_path.exists():
        content = env_example_path.read_text(encoding='utf-8')
    else:
        # Create default content
        content = """# ============================================
# AGENTIC AI STUDY COMPANION - CONFIGURATION
# ============================================

# Your Email Address (where you'll receive notifications)
USER_EMAIL=doe839319@gmail.com

# SMTP Email Configuration (for sending proactive reminders)
SENDER_EMAIL=doe839319@gmail.com
SENDER_PASSWORD=qcokkdvzyhskelwo

# SMTP Settings
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# MongoDB Connection
MONGODB_CONNECTION_STRING=mongodb+srv://prosus-db-user:yLFIMGwT48qUKxDG@prosus-db-user.wfei3mu.mongodb.net/?retryWrites=true&w=majority

# Supabase Configuration
SUPABASE_URL=https://dpyvbkrfasiskdrqimhf.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRweXZia3JmYXNpc2tkcnFpbWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDEzNzUsImV4cCI6MjA3ODE3NzM3NX0.JGb_M_zbh2Lzrca8O_GY8UtCvMnZocsiUBEbpELsLV8
"""
    
    # Update password if needed
    if 'SENDER_PASSWORD=your_gmail_app_password_here' in content:
        content = content.replace(
            'SENDER_PASSWORD=your_gmail_app_password_here',
            'SENDER_PASSWORD=qcokkdvzyhskelwo'
        )
        print("✅ Updated SENDER_PASSWORD in .env file")
    
    # Write .env file
    env_path.write_text(content, encoding='utf-8')
    print(f"✅ Created/updated: {env_path}")
    
    # Verify
    from dotenv import load_dotenv
    load_dotenv(env_path)
    
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD', '').strip().replace(' ', '')
    
    print("\n📋 Current Configuration:")
    print(f"   USER_EMAIL: {os.getenv('USER_EMAIL')}")
    print(f"   SENDER_EMAIL: {sender_email}")
    print(f"   SENDER_PASSWORD: {'✅ SET' if sender_password else '❌ NOT SET'} (length: {len(sender_password)})")
    
    if sender_password:
        print(f"   Password preview: {sender_password[:2]}...{sender_password[-2:]}")
        if len(sender_password) == 16:
            print("   ✅ Password length is correct (16 characters)")
        else:
            print(f"   ⚠️ Password length is {len(sender_password)}, expected 16")
    
    print("\n" + "="*60)
    print("✅ Setup complete!")
    print("="*60)

if __name__ == '__main__':
    setup_env()

