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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error -- eslint can be annoying
// @ts-ignore - testing does not support it
import swaggerConfig from "../tsoa/swagger.json" assert { type: "json" };

export const app = express();

// Use body parser to read sent json payloads
app.use(json({ limit: "50mb" }));
app.use(urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

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
      console.warn(`Caught Validation Error for ${req.path.toString()}`);
      return res.status(422).json({
        message: "Validation Failed",
        details: err.fields,
      });
    }

    if (err instanceof Error) {
      console.error(
        `Caught Error for ${req.path.toString()}: ${err.name} - ${
          err.message
        }\n${err.stack}`,
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }

    next();
  },
);

app.use(
  "/docs",
  swaggerUi.serve,
  (_req: ExRequest, res: ExResponse): ExResponse => {
    return res.send(swaggerUi.generateHTML(swaggerConfig));
  },
);

RegisterRoutes(app);
