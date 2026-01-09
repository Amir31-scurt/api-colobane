"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
