import requests

BASE_URL = "http://localhost:3000"
LOGIN_ENDPOINT = "/api/auth/admin/login"
TIMEOUT = 30

# Replace these with valid admin credentials for the success test
VALID_ADMIN_EMAIL = "admin@example.com"
VALID_ADMIN_PASSWORD = "correct_password"

# Invalid credentials for failure test
INVALID_ADMIN_EMAIL = "admin@example.com"
INVALID_ADMIN_PASSWORD = "wrong_password"


def test_admin_login_success_and_failure():
    # Test success login
    url = BASE_URL + LOGIN_ENDPOINT
    headers = {"Content-Type": "application/json"}
    payload_valid = {
        "email": VALID_ADMIN_EMAIL,
        "password": VALID_ADMIN_PASSWORD
    }
    try:
        response = requests.post(url, json=payload_valid, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200 for valid login, got {response.status_code}"
        json_resp = response.json()
        # The PRD states to receive a JWT token, verify 'token' in response or similar
        assert isinstance(json_resp, dict), "Response is not a JSON object"
        token = json_resp.get("token")
        assert token and isinstance(token, str) and len(token) > 0, "JWT token not found in response"
    except requests.RequestException as e:
        assert False, f"RequestException during valid login test: {e}"

    # Test failure login
    payload_invalid = {
        "email": INVALID_ADMIN_EMAIL,
        "password": INVALID_ADMIN_PASSWORD
    }
    try:
        response_invalid = requests.post(url, json=payload_invalid, headers=headers, timeout=TIMEOUT)
        assert response_invalid.status_code == 401, f"Expected 401 Unauthorized for invalid login, got {response_invalid.status_code}"
    except requests.RequestException as e:
        assert False, f"RequestException during invalid login test: {e}"

test_admin_login_success_and_failure()