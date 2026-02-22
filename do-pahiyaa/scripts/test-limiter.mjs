
async function testRateLimiter() {
    const url = 'http://localhost:3000/api/leads/unlock';
    const payload = { lead_id: 'test-lead-123' };

    console.log("Starting Auth & Rate Limit Test on /api/leads/unlock...");

    // Test 1: No Auth Token
    console.log("\n--- Test 1: No Auth Token ---");
    const noAuthRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    console.log("Status Code:", noAuthRes.status, "Expected: 401");
    console.log("Response:", await noAuthRes.text());

    // Test 2: Fake Auth Token
    console.log("\n--- Test 2: Fake Auth Token ---");
    const fakeAuthRes = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake_invalid_jwt_token_12345'
        },
        body: JSON.stringify(payload)
    });
    console.log("Status Code:", fakeAuthRes.status, "Expected: 401");
    console.log("Response:", await fakeAuthRes.text());

    // Note: To test the actual rate limit of 60 req/min, we would need 
    // a valid JWT and Redis connection. Since Upstash is returning 'degraded mode' 
    // it will likely bypass the rate limit locally, but we can still spam 65 requests.
    console.log("\n--- Test 3: Spamming 65 Requests ---");
    let responses = [];
    for (let i = 0; i < 65; i++) {
        responses.push(fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake_invalid_jwt_token_12345'
            },
            body: JSON.stringify(payload)
        }).then(r => r.status));
    }
    const results = await Promise.all(responses);

    const count401 = results.filter(s => s === 401).length;
    const count429 = results.filter(s => s === 429).length;

    console.log(`Sent 65 requests.`);
    console.log(`401 Unauthorized Count: ${count401} (Auth blocked them)`);
    console.log(`429 Too Many Requests Count: ${count429} (Rate Limiter blocked them)`);

    if (count429 > 0) {
        console.log("Rate limiter is active!");
    } else {
        console.log("Rate limiter bypassed locally (due to missing Upstash Redis keys in .env.local).");
    }
}

testRateLimiter();
