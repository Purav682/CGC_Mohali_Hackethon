import requests
from flask import Flask, jsonify, request
import re
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# SQL Injection detection patterns
SQL_INJECTION_PATTERNS = [
    r"'.*--",
    r"\b(OR|AND)\s+\d+=\d+",
    r"UNION.*SELECT",
    r"EXEC(\s|\+)+(SELECT|INSERT|DELETE)"
]

def check_sql_injection(log_entry):
    """Check if log entry contains SQL injection patterns"""
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, log_entry, re.IGNORECASE):
            return True
    return False

# New endpoint: /scan?website=https://example.com
@app.route('/scan', methods=['GET'])
def scan_website():
    website = request.args.get('website')
    if not website:
        return jsonify({'error': 'Missing website parameter'}), 400
    try:
        response = requests.get(website)
        logs = response.text  # In real app, parse server logs

        attacks = []
        # DEMO: Always add a fake attack so dashboard shows data
        attacks.append({
            'url': website,
            'payload': "' OR 1=1 --",
            'timestamp': datetime.now().isoformat(),
            'ip': '192.168.1.1',
            'severity': 'High'
        })
        for line in logs.split('\n'):
            if check_sql_injection(line):
                attacks.append({
                    'url': website,
                    'payload': line,
                    'timestamp': datetime.now().isoformat(),
                    'ip': '192.168.1.1',
                    'severity': 'High' if 'UNION' in line.upper() else 'Medium'
                })
        return jsonify({'attacks': attacks})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)