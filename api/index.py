import os
import sys

# Add the api directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

def handler(request):
    """Test handler."""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': '{"status": "ok", "message": "Vercel Python function works!"}'
    }
