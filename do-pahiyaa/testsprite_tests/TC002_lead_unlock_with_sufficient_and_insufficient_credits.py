import requests
import traceback

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Placeholder tokens and lead IDs for testing - replace with actual values or proper setup
# The test assumes you have two dealer tokens: one with sufficient credits and one with zero credits
DEALER_TOKEN_SUFFICIENT = "dealer_token_with_credits"
DEALER_TOKEN_ZERO = "dealer_token_zero_credits"
# A valid leadId to unlock; in real scenario, should be dynamically created or fetched
VALID_LEAD_ID = "lead_test_123"

def test_lead_unlock_with_sufficient_and_insufficient_credits():
    unlock_endpoint = f"{BASE_URL}/api/leads/unlock"
    headers_sufficient = {
        "Authorization": f"Bearer {DEALER_TOKEN_SUFFICIENT}"
    }
    headers_zero = {
        "Authorization": f"Bearer {DEALER_TOKEN_ZERO}"
    }
    
    # First test: dealer has sufficient credits
    try:
        params = {"leadId": VALID_LEAD_ID}
        response = requests.post(unlock_endpoint, headers=headers_sufficient, params=params, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}, body: {response.text}"
        json_data = response.json()
        # Validate presence of contact_info and remaining_credits in response
        assert "contact_info" in json_data, "Response JSON missing 'contact_info'"
        assert "remaining_credits" in json_data, "Response JSON missing 'remaining_credits'"
        # remaining_credits should be int and >= 0
        remaining_credits = json_data["remaining_credits"]
        assert isinstance(remaining_credits, int) and remaining_credits >= 0, "'remaining_credits' should be non-negative integer"
    except Exception:
        print("Error during lead unlock with sufficient credits:")
        traceback.print_exc()
        raise

    # Second test: dealer has zero credits
    try:
        params = {"leadId": VALID_LEAD_ID}
        response = requests.post(unlock_endpoint, headers=headers_zero, params=params, timeout=TIMEOUT)
        assert response.status_code == 402, f"Expected 402 Insufficient Credits, got {response.status_code}, body: {response.text}"
    except Exception:
        print("Error during lead unlock with zero credits:")
        traceback.print_exc()
        raise

test_lead_unlock_with_sufficient_and_insufficient_credits()