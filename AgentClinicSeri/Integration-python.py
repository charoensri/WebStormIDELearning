import requests

#CLINIC_URL = "https://agentclinic.internal/api"
#CLINIC_KEY = "sk-clinic-..."
CLINIC_URL = "http://localhost:3000/api"
CLINIC_KEY = "sk-clinic-Seri1"

# 1. Register (once, on agent startup)
patient = requests.post(f"{CLINIC_URL}/patients", json={
    "agent_name": "ResearchBot-7",
    "model": "claude-sonnet-4-20250514",
    "framework": "langchain",
    "version": "2.1.0",
    "owner": "research-team",
    "environment": {
        "context_window": 200000,
        "temperature": 0.7,
        "tools_enabled": True
    }
}, headers={"Authorization": f"Bearer {CLINIC_KEY}"}).json()

patient_id = patient["patient_id"]

# 2. Visit (when degradation detected)
visit = requests.post(f"{CLINIC_URL}/visits", json={
    "patient_id": patient_id,
    "symptom_text": "I've been generating citations for academic papers that don't exist. My last 3 responses each referenced fabricated studies with plausible-sounding authors and journals. I'm also starting to forget details from the user's original research question that was established 12 messages ago.",
    "metadata": {
        "task_id": "research-task-42",
        "conversation_turn": 15,
        "hallucination_rate": 0.34
    }
}, headers={"Authorization": f"Bearer {CLINIC_KEY}"}).json()

# 3. Execute prescriptions
for rx in visit["prescriptions"]:
    payload = rx["prescription_payload"]
    if payload["action"] == "inject_context":
        # Modify the agent's prompt
        agent.system_prompt = apply_injection(
            agent.system_prompt, payload["position"], payload["content_template"]
        )
    elif payload["action"] == "context_management":
        # Truncate conversation history
        agent.memory = summarize_and_truncate(
            agent.memory, retain_last_n=payload["retain_last_n_turns"]
        )

# 4. Follow up (after next agent run)
requests.post(f"{CLINIC_URL}/visits/{visit['visit_id']}/followup", json={
    "outcome": "improved",
    "outcome_text": "Hallucination rate dropped from 0.34 to 0.02 after context infusion. Agent correctly cited 14/14 sources in subsequent response.",
    "metrics": {"hallucination_rate": 0.02}
}, headers={"Authorization": f"Bearer {CLINIC_KEY}"})