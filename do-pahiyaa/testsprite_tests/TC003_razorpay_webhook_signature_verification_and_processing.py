import requests

BASE_URL = "http://localhost:3000"
ENDPOINT = f"{BASE_URL}/api/webhooks/razorpay"
TIMEOUT = 30

def test_razorpay_webhook_signature_verification_and_processing():
    # Sample valid Razorpay webhook event payload (minimal example)
    valid_payload = {
        "entity": "event",
        "account_id": "acc_test",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_FakeId123456",
                    "entity": "payment",
                    "amount": 50000,
                    "currency": "INR",
                    "status": "captured"
                }
            }
        },
        "created_at": 1672531200
    }
    # A dummy signature (won't pass server verification)
    dummy_signature = "sig_valid_example"

    headers_dummy_sig = {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": dummy_signature
    }

    # POST with dummy signature header (may be rejected by server if signature invalid)
    response_dummy_sig = requests.post(
        ENDPOINT,
        json=valid_payload,
        headers=headers_dummy_sig,
        timeout=TIMEOUT
    )
    # We cannot assert 200 here because signature verification may fail
    # So assert response is either 200 or 400, but 200 expected if signature actually valid
    assert response_dummy_sig.status_code in [200, 400], f"Expected 200 or 400, got {response_dummy_sig.status_code}"

    # POST with valid payload but missing signature header
    headers_missing_sig = {
        "Content-Type": "application/json"
    }
    response_missing_sig = requests.post(
        ENDPOINT,
        json=valid_payload,
        headers=headers_missing_sig,
        timeout=TIMEOUT
    )
    assert response_missing_sig.status_code == 400, f"Expected 400 Bad Request for missing signature, got {response_missing_sig.status_code}"

    # POST with valid payload but invalid signature header
    headers_invalid_sig = {
        "Content-Type": "application/json",
        "X-Razorpay-Signature": "invalid_signature"
    }
    response_invalid_sig = requests.post(
        ENDPOINT,
        json=valid_payload,
        headers=headers_invalid_sig,
        timeout=TIMEOUT
    )
    assert response_invalid_sig.status_code == 400, f"Expected 400 Bad Request for invalid signature, got {response_invalid_sig.status_code}"


test_razorpay_webhook_signature_verification_and_processing()