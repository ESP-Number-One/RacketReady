import { app } from "./app.js";
import * as multer from "multer";
import * as path from "path";

const port = process.env.PORT || 3000;

// Allow CORS access when not in production.

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

export const upload = multer({ storage: storage });
