import swaggerUi from "swagger-ui-express";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export function mountSwagger(app: any) {
  const swaggerPath = path.join(process.cwd(), "src", "docs", "swagger-output.json");

  app.get("/docs-json", (_req: any, res: any) => {
    if (!existsSync(swaggerPath)) {
      return res.status(500).json({
        message: "swagger-output.json introuvable. Lance `npm run swagger:gen`."
      });
    }

    const raw = readFileSync(swaggerPath, "utf-8");
    return res.json(JSON.parse(raw));
  });

  app.use("/docs", (req: any, res: any, next: any) => {
    if (!existsSync(swaggerPath)) {
      return res.status(500).send("swagger-output.json introuvable. Lance `npm run swagger:gen`.");
    }
    return next();
  });

  app.use("/docs", swaggerUi.serve, (req: any, res: any, next: any) => {
    const raw = readFileSync(swaggerPath, "utf-8");
    const swaggerDocument = JSON.parse(raw);
    return swaggerUi.setup(swaggerDocument)(req, res, next);
  });
}
