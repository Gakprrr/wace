import http from 'k6/http';
import { check, sleep } from 'k6';

// Exportation de la configuration du test
export const options = {
  // Définition de "stages" pour simuler une montée en charge (Ramp-up)
  stages: [
    { duration: '30s', target: 20 }, // Montée progressive à 20 utilisateurs sur 30s
    { duration: '1m', target: 20 },  // Maintien à 20 utilisateurs pendant 1 minute
    { duration: '30s', target: 0 },  // Descente à 0 utilisateurs sur 30s
  ],
  thresholds: {
    // Les requêtes HTTP doivent répondre en moins de 500ms pour 95% des cas
    http_req_duration: ['p(95)<500'],
    // Le taux d'erreur HTTP doit être inférieur à 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Scénario 1: Visiter la page d'accueil
  const resHome = http.get(`${BASE_URL}/`);
  check(resHome, {
    'Homepage status is 200': (r) => r.status === 200,
    'Homepage loaded fast': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Scénario 2: Visiter l'API des articles pour tester la charge DB
  const resApi = http.get(`${BASE_URL}/api/articles`);
  check(resApi, {
    'API Articles status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
