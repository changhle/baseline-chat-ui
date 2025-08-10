from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import werkzeug.utils

app = Flask(__name__)
CORS(app)

LOG_FOLDER = 'logs'
UPLOAD_FOLDER = 'uploads'

# Create log and upload folders if they don't exist
if not os.path.exists(LOG_FOLDER):
    os.makedirs(LOG_FOLDER)
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/log', methods=['POST'])
def log_conversation():
    if 'payload' not in request.form:
        return jsonify({'status': 'error', 'message': 'Missing payload data'}), 400

    try:
        payload = json.loads(request.form['payload'])
    except json.JSONDecodeError:
        return jsonify({'status': 'error', 'message': 'Invalid JSON payload'}), 400
    
    uid = payload.get('uid')
    if not uid:
        return jsonify({'status': 'error', 'message': 'Missing uid in payload'}), 400

    # Sanitize UID to create a valid filename and define user-specific log file path
    safe_uid = werkzeug.utils.secure_filename(str(uid))
    log_file_path = os.path.join(LOG_FOLDER, f"conversation_log_{safe_uid}.json")

    saved_files_info = []
    if 'files' in request.files:
        uploaded_files = request.files.getlist('files')
        for file in uploaded_files:
            if file and file.filename:
                filename = werkzeug.utils.secure_filename(file.filename)
                unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}_{filename}"
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(filepath)
                saved_files_info.append({
                    'original_filename': filename,
                    'saved_path': filepath
                })

    log_entry = {
        'uid': uid,
        'timestamp': datetime.now().isoformat(),
        'user_message': payload.get('user_message'),
        'assistant_message': payload.get('assistant_message'),
        'files': saved_files_info
    }
    
    try:
        # Initialize log file if it doesn't exist
        if not os.path.exists(log_file_path):
            with open(log_file_path, 'w', encoding='utf-8') as f:
                json.dump([], f, indent=4, ensure_ascii=False)

        # Read current logs, append new entry, and write back
        with open(log_file_path, 'r+', encoding='utf-8') as f:
            try:
                logs = json.load(f)
            except json.JSONDecodeError:
                logs = [] # If file is empty or corrupted, start a new list
            logs.append(log_entry)
            f.seek(0)
            f.truncate()
            json.dump(logs, f, indent=4, ensure_ascii=False)
            
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        app.logger.error(f"Error writing to log file {log_file_path}: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/history/<uid>', methods=['GET'])
def get_history(uid):
    """Retrieves the conversation history for a given UID."""
    if not uid:
        return jsonify({'status': 'error', 'message': 'UID is required'}), 400

    safe_uid = werkzeug.utils.secure_filename(str(uid))
    log_file_path = os.path.join(LOG_FOLDER, f"conversation_log_{safe_uid}.json")

    if os.path.exists(log_file_path):
        try:
            with open(log_file_path, 'r', encoding='utf-8') as f:
                history = json.load(f)
            return jsonify(history), 200
        except Exception as e:
            app.logger.error(f"Error reading log file {log_file_path}: {e}")
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        # No history for this user yet, return empty list
        return jsonify([]), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
