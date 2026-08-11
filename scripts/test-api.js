const fs = require('fs');
const http = require('http');

const BASE_URL = 'http://localhost:3000/api';

const endpoints = [
  { route: '/admin/contacts', methods: ['GET', 'POST'] },
  { route: '/admin/export/catalogue', methods: ['GET'] },
  { route: '/admin/stats', methods: ['GET'] },
  { route: '/admin/stats/articles', methods: ['GET'] },
  { route: '/admin/stats/users', methods: ['GET'] },
  { route: '/admin/users', methods: ['GET'] },
  { route: '/articles', methods: ['GET', 'POST'] },
  { route: '/articles/featured', methods: ['GET'] },
  { route: '/articles/search', methods: ['GET'] },
  { route: '/auth/session', methods: ['GET'] },
  { route: '/auth/login', methods: ['POST'] },
  { route: '/auth/register', methods: ['POST'] },
  { route: '/categories', methods: ['GET', 'POST'] },
  { route: '/contacts', methods: ['GET'] },
  { route: '/notifications/subscribe', methods: ['GET'] },
  { route: '/users/me', methods: ['GET', 'PUT'] },
  { route: '/users/me/likes', methods: ['GET'] },
  { route: '/users/me/notifications', methods: ['GET'] }
];

async function testEndpoint(endpoint, method) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: ['POST', 'PUT'].includes(method) ? JSON.stringify({ dummy: 'data' }) : undefined
    });
    return { route: endpoint, method, status: response.status, ok: response.ok };
  } catch (error) {
    return { route: endpoint, method, status: 'Error', error: error.message };
  }
}

async function runTests() {
  console.log('Starting API Tests...');
  const results = [];
  for (const { route, methods } of endpoints) {
    for (const method of methods) {
      const result = await testEndpoint(route, method);
      console.log(`[${method}] ${route} -> ${result.status}`);
      results.push(result);
    }
  }

  fs.writeFileSync('api-test-results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to api-test-results.json');
}

runTests();
