const cron = require("node-cron");
const WorkerManager = require("./worker_manager");

const manager = new WorkerManager();

// Run different tasks at different times
cron.schedule("0 0 * * *", () => {
  // manager.run("job.js"); // Runs your original job
});
