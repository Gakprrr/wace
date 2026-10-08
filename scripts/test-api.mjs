import 'dotenv/config';
import fs from 'fs';
import { SignJWT } from 'jose';

const BASE_URL = 'http://localhost:3000/api';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production"
);

// Helper pour générer un token administrateur complet
async function getAdminCookie() {
  const token = await new SignJWT({
    userId: 'admin-test-id',
    email: 'admin@wace.com',
    role: 'ADMIN',
    twoFactorVerified: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
  return token;
}

const endpoints = [
  // Endpoints Admin (Nécessite le cookie Admin)
  { route: '/admin/contacts', methods: ['GET', 'POST'], body: { platform: "whatsapp", label: "Contact", url: "https://wa.me/0" } },
  { route: '/admin/stats', methods: ['GET'] },
  { route: '/admin/stats/articles', methods: ['GET'] },
  { route: '/admin/stats/users', methods: ['GET'] },
  { route: '/admin/users', methods: ['GET'] },
  
  // Endpoints Publics & Articles
  { route: '/articles', methods: ['GET', 'POST'], body: { title: "Test Article", content: "Test", price: 10, stock: 5, categoryId: "c1" } },
  { route: '/articles/featured', methods: ['GET'] },
  
  // Authentification (Certains donnent 400 si on passe pas les bonnes données)
  { route: '/auth/session', methods: ['GET'] }, // Doit retourner la session vu qu'on passe le cookie
  { route: '/auth/login', methods: ['POST'], body: { email: "admin@wace.com", password: "wrongpassword" } }, // Va renvoyer 401 (identifiants invalides) mais pas 400 !
  { route: '/auth/register', methods: ['POST'], body: { email: `test_${Date.now()}@test.com`, password: "password123", name: "Test" } },
  
  // Catégories
  { route: '/categories', methods: ['GET', 'POST'], body: { name: "Test Category", slug: `test-${Date.now()}` } },
  
  // Contacts
  { route: '/contacts', methods: ['GET'] },
  
  // Utilisateurs (Nécessite cookie)
  { route: '/users/me', methods: ['GET', 'PUT'], body: { name: "New Name" } },
  { route: '/users/me/likes', methods: ['GET'] },
  { route: '/users/me/notifications', methods: ['GET'] }
];

async function testEndpoint(endpoint, method, adminCookie, defaultBody) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminCookie}`
      }
    };
    
    if (['POST', 'PUT'].includes(method) && defaultBody) {
      options.body = JSON.stringify(defaultBody);
    }

    const response = await fetch(url, options);
    return { route: endpoint, method, status: response.status, ok: response.ok };
  } catch (error) {
    return { route: endpoint, method, status: 'Error', error: error.message };
  }
}

async function runTests() {
  console.log('Generating Admin Token...');
  const cookie = await getAdminCookie();
  
  console.log('Starting API Tests with Authentication...');
  const results = [];
  
  for (const { route, methods, body } of endpoints) {
    for (const method of methods) {
      const result = await testEndpoint(route, method, cookie, body);
      console.log(`[${method}] ${route} -> ${result.status}`);
      results.push(result);
    }
  }

  fs.writeFileSync('api-test-results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to api-test-results.json');
}

runTests();
