import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_marketplace_search_with_valid_and_invalid_filters():
    valid_params = {
        "q": "Royal Enfield",
        "brand": "Royal Enfield",
        "city": "Delhi",
        "price_max": 150000
    }
    invalid_params = {
        "price_max": "not_a_number"
    }

    # Test with valid filters
    try:
        valid_response = requests.get(f"{BASE_URL}/api/listings", params=valid_params, timeout=TIMEOUT)
        assert valid_response.status_code == 200, f"Expected 200, got {valid_response.status_code}"
        data = valid_response.json()
        assert isinstance(data, dict), "Response JSON is not a dictionary"
        # Expect 'listings' array and 'pagination' metadata in response
        assert "listings" in data and isinstance(data["listings"], list), "'listings' missing or not a list"
        assert "pagination" in data and isinstance(data["pagination"], dict), "'pagination' missing or not a dict"
    except requests.RequestException as e:
        assert False, f"Request failed for valid filters: {e}"
    except ValueError:
        assert False, "Response content is not valid JSON for valid filters"

    # Test with invalid price_max filter
    try:
        invalid_response = requests.get(f"{BASE_URL}/api/listings", params=invalid_params, timeout=TIMEOUT)
        assert invalid_response.status_code == 422, f"Expected 422, got {invalid_response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed for invalid filters: {e}"

test_marketplace_search_with_valid_and_invalid_filters()