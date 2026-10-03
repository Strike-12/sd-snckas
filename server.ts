import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import apiApp from "./artifacts/api-server/src/app";

const app = express();
const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production";
const distPath = path.resolve("dist");

// Mount API routes (/api/shopify/products, /api/shopify/checkout, /api/healthz)
app.use(apiApp);

if (isProduction && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  const vite = await createViteServer({
    configFile: path.resolve("artifacts/sds-snackz-storefront/vite.config.ts"),
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
