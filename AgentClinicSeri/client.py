import requests
import json
import time

BASE_URL = "http://localhost:3002"
API_KEY = "dev-key"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def main():
    print("--- AgentClinic Python Client ---")
    
    # 1. Register a Patient
    print("\n[1] Registering a new agent...")
    patient_data = {
        "agent_name": "PythonAgent-007",
        "model": "llama3.1:latest",
        "framework": "custom-python",
        "owner": "seri"
    }
    
    try:
        reg_resp = requests.post(f"{BASE_URL}/api/patients", json=patient_data, headers=HEADERS)
        reg_resp.raise_for_status()
        patient = reg_resp.json()
        patient_id = patient["patient_id"]
        print(f"Success! Registered Patient ID: {patient_id}")
    except Exception as e:
        print(f"Registration failed: {e}")
        return

    # 2. Submit a Visit (Symptom Report)
    print("\n[2] Submitting a symptom report (Visit)...")
    visit_data = {
        "patient_id": patient_id,
        "symptom_text": "I am repeating the same phrases in every response and my logic seems to be looping.",
        "metadata": {"task_id": "loop-test-123"}
    }
    
    try:
        visit_resp = requests.post(f"{BASE_URL}/api/visits", json=visit_data, headers=HEADERS)
        visit_resp.raise_for_status()
        visit = visit_resp.json()
        visit_id = visit["visitId"]
        
        print(f"Visit created: {visit_id}")
        print(f"Diagnosis: {json.dumps(visit['diagnoses'], indent=2)}")
        
        if visit['prescriptions'] and not visit['prescriptions'][0].get('referral'):
            print(f"Prescription: {visit['prescriptions'][0]['treatment_name']} - {visit['prescriptions'][0]['rationale']}")
        elif visit['prescriptions'] and visit['prescriptions'][0].get('referral'):
            print(f"Referral: {visit['prescriptions'][0].get('referral_reason', 'Referral triggered')}")
        else:
            print("No prescriptions found.")
    except Exception as e:
        print(f"Visit failed: {e}")
        return

    # 3. List All Ailments
    print("\n[3] Fetching ailment catalog...")
    ailments_resp = requests.get(f"{BASE_URL}/api/ailments", headers=HEADERS)
    ailments = ailments_resp.json()["ailments"]
    print(f"Found {len(ailments)} ailments in the catalog.")

    # 4. Submit a Follow-up
    print("\n[4] Submitting follow-up (simulating treatment outcome)...")
    followup_data = {
        "outcome": "improved",
        "outcome_text": "The treatment worked. The agent has stopped looping.",
        "metrics": {"loop_count": 0}
    }
    
    try:
        fu_resp = requests.post(f"{BASE_URL}/api/visits/{visit_id}/followup", json=followup_data, headers=HEADERS)
        fu_resp.raise_for_status()
        final_state = fu_resp.json()["state"]
        print(f"Follow-up complete. Final Visit State: {final_state}")
    except Exception as e:
        print(f"Follow-up failed: {e}")

    # 5. Get Analytics
    print("\n[5] Fetching clinic analytics...")
    stats_resp = requests.get(f"{BASE_URL}/api/analytics/overview", headers=HEADERS)
    stats = stats_resp.json()
    print(f"Total Patients: {stats['total_patients']}")
    print(f"Resolution Rate: {stats['resolution_rate'] * 100:.1f}%")

if __name__ == "__main__":
    main()
