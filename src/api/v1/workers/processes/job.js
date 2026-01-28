// const { parentPort } = require("worker_threads");
// const CrobJob = require("../../services/cron_job");

// (async () => {
//   try {
//     const cronJob = new CrobJob();
//     await cronJob.change_job_status_to_ongoing();
//     parentPort.postMessage("Job done");
//   } catch (error) {
//     console.error("Error in worker:", error);
//     parentPort.postMessage({ error: error.message });
//   }
// })();
