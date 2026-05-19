//imports
const express = require("express");
const cors = require("cors");
const Webhook = require("./webhook");
const cookie_parser = require("cookie-parser");
const { req_logger } = require("@configs/logger");
const v1_routes = require("@api/v1/routers");
const bodyParser = require("body-parser");

const webhook = new Webhook();

//initializations
const app = express();

//for public files
app.use(express.static("src/api/v1/public"));

//webhook
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  webhook.handle
);

//middlewares
app.use(cookie_parser());
app.use(express.json({ limit: "100mb" }));
const allowedOrigins = [
  process.env.FRONTEND_DOMAIN,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

const cors_options = {
  origin(origin, callback) {
    // allow non-browser clients (no Origin header) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
app.use(cors(cors_options));
app.use(req_logger);
app.use("/api/v1", v1_routes);

module.exports = app;
