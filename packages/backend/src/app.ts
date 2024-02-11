import type {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import express, { json, urlencoded } from "express";
import cors from "cors";
import * as swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { RegisterRoutes } from "../tsoa/routes.js";
import swaggerConfig from "../tsoa/swagger.json" with { type: "json" };

export const app = express();

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  }),
);

app.use(json());
app.use(cors());
app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(
  (
    err: unknown,
    req: ExRequest,
    res: ExResponse,
    next: NextFunction,
  ): ExResponse | undefined => {
    if (err instanceof ValidateError) {
      console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
      return res.status(422).json({
        message: "Validation Failed",
        details: err.fields,
      });
    }

    if (err instanceof Error) {
      console.error(
        `Caught Error for ${req.path}: ${err.name} - ${err.message}\n${err.stack}`,
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }

    next();
  },
);

app.use(
  "/",
  swaggerUi.serve,
  (_req: ExRequest, res: ExResponse): ExResponse => {
    return res.send(swaggerUi.generateHTML(swaggerConfig));
  },
);

RegisterRoutes(app);
