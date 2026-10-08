import { Router } from "express";

const router = Router();

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "WACE — Express REST API Documentation",
    description: "Documentation officielle de l'API REST Full-Stack pour la plateforme e-commerce WACE Wear The Energy",
    version: "1.0.0",
    contact: {
      name: "WACE Support",
      url: "https://wace.store",
    },
  },
  servers: [
    {
      url: "http://localhost:4000/api",
      description: "Serveur API Local / Dev",
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        summary: "Connexion utilisateur",
        description: "Authentifie l'utilisateur via email et mot de passe et retourne un JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "admin@wace.com" },
                  password: { type: "string", example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Authentification réussie" },
          401: { description: "Identifiants invalides" },
        },
      },
    },
    "/articles": {
      get: {
        summary: "Liste paginée des articles du catalogue",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          { name: "state", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Liste des articles récupérée avec succès" },
        },
      },
    },
    "/articles/{id}/qr": {
      get: {
        summary: "Génération du Code QR d'un produit",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "DataURL de l'image du Code QR" },
        },
      },
    },
    "/orders": {
      post: {
        summary: "Création d'une nouvelle commande client",
        responses: {
          201: { description: "Commande créée avec succès" },
        },
      },
      get: {
        summary: "Historique des commandes de l'utilisateur connecté",
        responses: {
          200: { description: "Liste des commandes reçue" },
        },
      },
    },
    "/admin/export/qr-pdf": {
      get: {
        summary: "[ADMIN] Export PDF A4 des étiquettes QR Code",
        responses: {
          200: { description: "Fichier PDF binaire à télécharger" },
        },
      },
    },
  },
};

// GET /api/docs -> OpenAPI 3.0 JSON Spec
router.get("/", (req, res) => {
  res.json(openApiSpec);
});

export default router;
