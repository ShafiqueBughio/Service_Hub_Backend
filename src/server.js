/** @format */

require("module-alias/register");
require("dotenv").config();

const http = require("http");
const app = require("./app");
const { logger } = require("@configs/logger");

const SocketManager = require("@api/v1/socket/socket_manager");

const server = http.createServer(app);

// init sockets
new SocketManager(server);

server.listen(process.env.PORT, () => {
  logger.info(`Server running on http://localhost:${process.env.PORT}`);
});
