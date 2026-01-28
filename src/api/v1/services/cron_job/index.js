const { prisma } = require("../../../../configs/prisma");

class CrobJob {
  change_job_status_to_ongoing = async () => {
    const current_date = new Date(new Date().setUTCHours(0, 0, 0, 0));
    const data = await prisma.jobs.updateMany({
      where: {
        job_date: current_date,
        provider_id: {
          not: null,
        },

        job_status: {
          notIn: ["COMPLETED", "CANCELLED", "DISPUTED", "ONGOING"],
        },
      },
      data: {
        job_status: "ONGOING",
      },
    });

    console.log("Cron Job data:", data);
  };
}

module.exports = CrobJob;
