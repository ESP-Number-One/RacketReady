import { app } from "./app.js";

const port = process.env.PORT || 3000;

// Allow CORS access when not in production.

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
