import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Colobane Marketplace API",
      version: "1.0.0",
      description: "API de la plateforme de commerce Colobane",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local Development Server",
      },
      {
        url: "https://api.mycolobane.com",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/infrastructure/http/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
