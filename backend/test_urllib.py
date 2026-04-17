import urllib.request
import json

def call_ollama_fallback(prompt: str, model: str = "llama3.2"):
    url = "http://localhost:11434/api/generate"
    data = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            return json.loads(result.get("response", "{}"))
    except Exception as e:
        return {"error": f"Ollama fallback failed: {str(e)}"}

print(call_ollama_fallback("test"))
