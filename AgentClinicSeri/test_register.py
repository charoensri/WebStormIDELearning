import requests

url = "http://localhost:3001/api/patients"
data = {
    "agent_name": "PythonTestAgent",
    "model": "llama3.1",
    "framework": "langchain",
    "owner": "dev-team"
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
