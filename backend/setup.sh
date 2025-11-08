#!/bin/bash
# Setup script for Study Companion Calendar Backend

echo "🚀 Study Companion - Calendar Integration Setup"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python $(python3 --version) found"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Test MongoDB connection
echo "🔌 Testing MongoDB connection..."
python3 database.py

if [ $? -ne 0 ]; then
    echo "⚠️  MongoDB connection test failed (this is okay if you haven't run calendar_reader yet)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run: python3 calendar_reader.py  (fetch calendar events)"
echo "  2. Run: python3 api.py              (start API server)"
echo "  3. Open: http://localhost:5001      (API will be running here)"
echo ""
echo "🎉 Ready to integrate with your React app!"

