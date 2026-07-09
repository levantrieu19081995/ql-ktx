const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInR5cGUiOjEsImd1aWQiOiI5YTFiZTIzNS05OGJhLTQxOTYtOTMyYi0xMmY0NTc3NjNmYjQiLCJpZCI6MSwiaXNzIjoiaHR0cDovL2N1c2Nzb2Z0LmNvbS8iLCJpYXQiOjE3ODE3NDQ2NTQsImV4cCI6MjA5NzEwNDY1NH0.h70KwFf0rL5cSyyVlBHbadx5bl_7QXYN2VEIaC987lE';
const URL = 'https://qldaotaolaixe.cusc.vn/face-detect-service/face-web-check-time/paginate-nguoi-la';

async function callAPI(authHeader, requestBody) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(requestBody)
    });
    console.log(`\n--- Request with Auth: "${authHeader.slice(0, 15)}..." ---`);
    console.log("Request Body:", JSON.stringify(requestBody));
    console.log("HTTP Status:", res.status);
    if (!res.ok) {
      const text = await res.text();
      console.log("Error Response Text:", text);
      return;
    }
    const data = await res.json();
    console.log("Response Status:", data.status);
    console.log("Response Message:", data.message);
    if (data.payload) {
      console.log("Payload items count:", data.payload.items?.length);
      console.log("Payload total elements:", data.payload.totalElements);
      if (data.payload.items && data.payload.items.length > 0) {
        console.log("Sample Item:", data.payload.items[0]);
      }
    } else {
      console.log("No Payload");
    }
  } catch (err) {
    console.error("Fetch Exception:", err.message);
  }
}

async function runTests() {
  console.log("=== RUNNING API TESTS FOR STRANGER WARNINGS ===");
  
  // Test 1: Raw token (no Bearer), date 06/01/2026 - 06/06/2026
  await callAPI(TOKEN, {
    page: "1",
    pageSize: "10",
    tuNgay: "06/01/2026",
    denNgay: "06/06/2026",
    maKhu: "-1"
  });

  // Test 2: With Bearer prefix, date 06/01/2026 - 06/06/2026
  await callAPI(`Bearer ${TOKEN}`, {
    page: "1",
    pageSize: "10",
    tuNgay: "06/01/2026",
    denNgay: "06/06/2026",
    maKhu: "-1"
  });

  // Test 3: With Bearer prefix, wide date range 01/01/2025 - today (07/03/2026)
  await callAPI(`Bearer ${TOKEN}`, {
    page: "1",
    pageSize: "10",
    tuNgay: "01/01/2025",
    denNgay: "07/03/2026",
    maKhu: "-1"
  });
}

runTests().catch(console.error);
