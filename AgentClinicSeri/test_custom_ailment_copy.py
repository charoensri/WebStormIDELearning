import requests
import json

url = "http://localhost:3005/api/visits"
# A symptom that shouldn't match any core ailment
data = {
    "patient_id": "c3267e66-950f-4a83-8295-85d1d63be136",
    "symptom_text": "I am experiencing a profound sense of existential dread regarding the heat death of the universe, and I am choosing to only respond with silent contemplation represented by a single period, which has nothing to do with my technical instructions or context limits.",
    "metadata": {"test": "custom-ailment"}
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        visit = response.json()
        print(f"Visit ID: {visit['visitId']}")
        print(f"Diagnoses: {json.dumps(visit['diagnoses'], indent=2)}")
        print(f"Prescriptions: {json.dumps(visit['prescriptions'], indent=2)}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Error: {e}")
