from flask import Flask, request, Response, stream_with_context,render_template
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

OLLAMA_URL = "http://127.0.0.1:11434"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate_response():
    data = request.json
    ollama_response = requests.post(f"{OLLAMA_URL}/api/generate", json=data, stream=True)
    def generate():
        for line in ollama_response.iter_lines():
            if line:
                yield line + b'\n'  # Ensure proper streaming format
    

    
    return Response(stream_with_context(generate()), content_type="application/json")

@app.route('/api/chat', methods=['POST'])
def chat_response():
    data = request.json
    ollama_response = requests.post(f"{OLLAMA_URL}/api/chat", json=data, stream=True)
    def generate():
        for line in ollama_response.iter_lines():
            if line:
                yield line + b'\n'  # Ensure proper streaming format
    
    return Response(stream_with_context(generate()), content_type="application/json")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)
