import "dotenv/config";

const BASE_URL = "http://localhost:3000/api";

async function runTests() {
  console.log("🚀 Starting API Tests...\n");

  let clientToken = "";
  let adminToken = "";

  // 1. Validation test (Invalid Registration)
  console.log("--- 1. Validation Test (Invalid Registration) ---");
  const badRegRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid-email", password: "123" }),
  });
  const badRegData = await badRegRes.json();
  console.log("Expected Error:", badRegData);
  if (badRegRes.status !== 400) throw new Error("Validation test failed");
  console.log("✅ Validation test passed\n");

  // 2. Register new user
  console.log("--- 2. Register New User ---");
  const uniqueEmail = `testuser_${Date.now()}@test.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: uniqueEmail, password: "Password123!", name: "Test User" }),
  });
  const regData = await regRes.json();
  console.log("Register Response:", regData);
  if (regRes.status !== 201) throw new Error("Registration failed");
  console.log("✅ Registration passed\n");

  // 3. Login as client
  console.log("--- 3. Login as Client ---");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: uniqueEmail, password: "Password123!" }),
  });
  const loginData = await loginRes.json();
  clientToken = loginData.token;
  console.log("Login Response:", loginData);
  if (loginRes.status !== 200 || !clientToken) throw new Error("Login failed");
  console.log("✅ Login passed\n");

  // 4. Check Session
  console.log("--- 4. Check Session ---");
  const sessionRes = await fetch(`${BASE_URL}/auth/session`, {
    method: "GET",
    headers: { "Cookie": `token=${clientToken}` },
  });
  const sessionData = await sessionRes.json();
  console.log("Session Response:", sessionData);
  if (sessionRes.status !== 200) throw new Error("Session check failed");
  console.log("✅ Session passed\n");

  // 5. Fetch Public Articles
  console.log("--- 5. Fetch Public Articles ---");
  const articlesRes = await fetch(`${BASE_URL}/articles`, { method: "GET" });
  const articlesData = await articlesRes.json();
  console.log(`Found ${articlesData.articles?.length} articles.`);
  if (articlesRes.status !== 200) throw new Error("Articles fetch failed");
  console.log("✅ Public Articles passed\n");

  // 6. Test Admin Middleware (Unauthorized access)
  console.log("--- 6. Test Admin Middleware (Unauthorized Access) ---");
  const noAdminRes = await fetch(`${BASE_URL}/admin/users`, {
    method: "GET",
    headers: { "Cookie": `token=${clientToken}` },
  });
  console.log("Admin Route with Client Token Status:", noAdminRes.status);
  if (noAdminRes.status !== 403 && noAdminRes.status !== 401) throw new Error("Middleware test failed");
  console.log("✅ Admin Middleware test passed (blocked client)\n");

  // 7. Login as Admin
  console.log("--- 7. Login as Admin ---");
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@wace.com", password: "Admin@WACE2024!" }),
  });
  const adminLoginData = await adminLoginRes.json();
  adminToken = adminLoginData.token;
  if (!adminToken) throw new Error("Admin login failed");
  console.log("✅ Admin login passed\n");

  // 8. Test Admin Route (Authorized)
  console.log("--- 8. Fetch Admin Route (Authorized) ---");
  const adminRes = await fetch(`${BASE_URL}/admin/users`, {
    method: "GET",
    headers: { "Cookie": `token=${adminToken}` },
  });
  const adminData = await adminRes.json();
  console.log(`Found ${adminData.users?.length} users via admin route.`);
  if (adminRes.status !== 200) throw new Error("Admin route access failed");
  console.log("✅ Admin access passed\n");

  console.log("🎉 All basic API tests passed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test script failed:", err);
  process.exit(1);
});
