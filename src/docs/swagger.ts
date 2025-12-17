import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MyColobane API",
      version: "1.0.0",
      description: "API officielle de la plateforme MyColobane"
    },
    servers: [
      {
        url: "https://api.mycolobane.com",
        description: "Production"
      },
      {
        url: "http://localhost:3000",
        description: "Local"
      }
    ]
  },
  apis: ["src/routes/**/*.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);
