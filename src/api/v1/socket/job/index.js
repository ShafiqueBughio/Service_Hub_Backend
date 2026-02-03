/** @format */
const jobHandler = require("./job.handler");

module.exports = (io, socket) => {
  jobHandler(io, socket);
};
