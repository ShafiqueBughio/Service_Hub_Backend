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
const cors_options = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(cors_options));
app.use(req_logger);
app.use("/api/v1", v1_routes);

module.exports = app;
