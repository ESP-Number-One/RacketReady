import express, {json, urlencoded} from "express";
import cors from "cors";

// The only reason why this is here to remove the TS compiler error.
//  Justification: the TSOA library generates a build.ts -- this is always made before the
//  rest of this Typescript is generated if you use the `dev` script.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RegisterRoutes } from "../build/routes";

export const app = express();

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());
app.use(cors());
app.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next()
});
RegisterRoutes(app);
