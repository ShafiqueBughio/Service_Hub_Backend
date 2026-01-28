const { Worker } = require("worker_threads");
const path = require("path");
const { logger } = require("@configs/logger");

class WorkerManager {
  run(workerFileName, data = {}) {
    const workerPath = path.resolve(__dirname, `./processes/${workerFileName}`);
    const worker = new Worker(workerPath, { workerData: data });

    worker.on("message", (msg) => {
      logger.info(
        `[${workerFileName}] Worker finished: ${JSON.stringify(msg)}`
      );
    });

    worker.on("error", (err) => {
      logger.error(`[${workerFileName}] Worker error: ${JSON.stringify(err)}`);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        logger.error(
          `[${workerFileName}] Worker exited with code ${JSON.stringify(code)}`
        );
      }
    });

    return worker;
  }
}

module.exports = WorkerManager;
