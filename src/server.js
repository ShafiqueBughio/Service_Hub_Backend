/** @format */

require("module-alias/register");

const env = require("dotenv");
env.config();
const app = require("./app");
const { logger } = require("@configs/logger");
const SocketManager = require("@api/v1/socket/socket_manager");

// worker threads
require("../src/api/v1/workers/index.js");

const http_server = require("http").createServer(app);

new SocketManager(http_server);

http_server.listen(process.env.PORT, () => {
  logger.info(`listening on http://localhost:${process.env.PORT}`);
});
