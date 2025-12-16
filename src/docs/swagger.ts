// src/docs/swagger.ts
import { OpenAPIV3 } from "openapi-types";

const swagger: OpenAPIV3.Document = {
  openapi: "3.0.0",

  info: {
    title: "Colobane API Documentation",
    version: "1.0.0",
    description:
      "Documentation officielle de l’API Colobane Marketplace (Brands, Products, Categories, Orders, Payments, Promotions, Search, Seller Dashboard)."
  },

  servers: [
    { url: "http://localhost:4000", description: "Serveur local" }
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },

  tags: [
    { name: "Auth" },
    { name: "Brands" },
    { name: "Categories" },
    { name: "Products" },
    { name: "Orders" },
    { name: "Payments" },
    { name: "Promotions" },
    { name: "Search" },
    { name: "Seller Dashboard" }
  ],

  paths: {
    // ============================================================
    // AUTH
    // ============================================================
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Créer un utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  phone: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Utilisateur créé" },
          409: { description: "Email déjà utilisé" }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Connexion utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Connexion réussie" },
          401: { description: "Identifiants incorrects" }
        }
      }
    },

    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Obtenir le profil de l'utilisateur connecté",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Utilisateur trouvé" },
          401: { description: "Token absent ou invalide" }
        }
      }
    },

    // ============================================================
    // BRANDS
    // ============================================================
    "/api/brands": {
      get: {
        tags: ["Brands"],
        summary: "Lister toutes les marques",
        responses: {
          200: { description: "Liste des marques" }
        }
      },
      post: {
        tags: ["Brands"],
        summary: "Créer une marque",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "slug"],
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Marque créée" }
        }
      }
    },

    "/api/brands/{brandId}/categories": {
      get: {
        tags: ["Brands"],
        summary: "Voir les catégories d’une marque",
        parameters: [
          {
            name: "brandId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Liste des catégories liées à la marque" }
        }
      },
      put: {
        tags: ["Brands"],
        summary: "Assigner des catégories à une marque",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "brandId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  categoryIds: {
                    type: "array",
                    items: { type: "integer" }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Mise à jour effectuée" }
        }
      }
    },

    // ============================================================
    // CATEGORIES
    // ============================================================
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Lister toutes les catégories",
        responses: {
          200: { description: "Liste des catégories" }
        }
      },
      post: {
        tags: ["Categories"],
        summary: "Créer une catégorie",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "slug"],
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                  isGlobal: { type: "boolean" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Catégorie créée" }
        }
      }
    },

    "/api/categories/{slug}": {
      get: {
        tags: ["Categories"],
        summary: "Obtenir une catégorie par son slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: { description: "Catégorie trouvée" },
          404: { description: "Catégorie non trouvée" }
        }
      }
    },

    // ============================================================
    // PRODUCTS
    // ============================================================
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Lister les produits",
        responses: {
          200: { description: "Liste des produits" }
        }
      },
      post: {
        tags: ["Products"],
        summary: "Créer un produit",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Produit créé" }
        }
      }
    },
    "/api/products/search": {
        get: {
            tags: ["Products"],
            summary: "Recherche de produits",
            parameters: [
            {
                name: "q",
                in: "query",
                schema: { type: "string" },
                required: false
            }
            ],
            responses: {
            200: { description: "Résultats de recherche" }
            }
        }
    },
    "/api/products/{productId}": {
  put: {
    tags: ["Products"],
    summary: "Mettre à jour un produit",
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: "productId", in: "path", required: true, schema: { type: "integer" } }
    ],
    responses: {
      200: { description: "Produit mis à jour" },
      404: { description: "Produit introuvable" }
    }
  }
},
    "/api/products/{slug}": {
        get: {
            tags: ["Products"],
            summary: "Obtenir un produit via son slug",
            parameters: [
            {
                name: "slug",
                in: "path",
                required: true,
                schema: { type: "string" }
            }
            ],
            responses: {
            200: { description: "Produit trouvé" },
            404: { description: "Produit introuvable" }
            }
        }
    },



    // ============================================================
    // ORDERS
    // ============================================================
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Lister mes commandes",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Liste de commandes" }
        }
      },
      post: {
        tags: ["Orders"],
        summary: "Créer une commande",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Commande créée" }
        }
      }
    },

    "/api/orders/{orderId}": {
      get: {
        tags: ["Orders"],
        summary: "Obtenir une commande spécifique",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: { description: "Commande trouvée" },
          404: { description: "Commande introuvable" }
        }
      }
    },

    // ============================================================
    // PAYMENTS
    // ============================================================
    "/api/payments": {
      post: {
        tags: ["Payments"],
        summary: "Créer un paiement",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Paiement créé" }
        }
      }
    },

    "/api/payments/{paymentId}/confirm": {
      post: {
        tags: ["Payments"],
        summary: "Confirmer un paiement",
        parameters: [
          { name: "paymentId", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: { description: "Paiement confirmé" }
        }
      }
    },

    // ============================================================
    // PROMOTIONS
    // ============================================================
    "/api/promotions": {
      get: {
        tags: ["Promotions"],
        summary: "Lister les promotions",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Liste des promotions" }
        }
      },
      post: {
        tags: ["Promotions"],
        summary: "Créer une promotion",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Promotion créée" }
        }
      }
    },

    "/api/promotions/{promotionId}": {
      get: {
        tags: ["Promotions"],
        summary: "Obtenir une promotion",
        parameters: [
          {
            name: "promotionId",
            in: "path",
            schema: { type: "integer" },
            required: true
          }
        ],
        responses: {
          200: { description: "Promotion trouvée" },
          404: { description: "Introuvable" }
        }
      },
      put: {
        tags: ["Promotions"],
        summary: "Mettre à jour une promotion",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Promotion mise à jour" }
        }
      }
    },

    "/api/promotions/{promotionId}/toggle": {
      put: {
        tags: ["Promotions"],
        summary: "Activer / désactiver une promotion",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Statut modifié" }
        }
      }
    },

    "/api/promotions/{promotionId}/products": {
      put: {
        tags: ["Promotions"],
        summary: "Assigner une promotion aux produits",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Assignation effectuée" }
        }
      }
    },

    "/api/promotions/{promotionId}/brands": {
      put: {
        tags: ["Promotions"],
        summary: "Assigner une promotion aux marques",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Assignation effectuée" }
        }
      }
    },

    "/api/promotions/{promotionId}/categories": {
      put: {
        tags: ["Promotions"],
        summary: "Assigner une promotion aux catégories",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Assignation effectuée" }
        }
      }
    },

    // ============================================================
    // SEARCH
    // ============================================================
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Recherche globale",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Résultats de recherche" }
        }
      }
    },

    // ============================================================
    // SELLER DASHBOARD
    // ============================================================
    "/api/seller/dashboard": {
      get: {
        tags: ["Seller Dashboard"],
        summary: "Statistiques du vendeur",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Retourne les KPIs du vendeur" }
        }
      }
    }
  }
};

export default swagger;
