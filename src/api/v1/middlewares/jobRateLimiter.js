/** @format */

const { prisma }  = require("@configs/prisma");
const Responses   = require("@constants/responses");

const responses = new Responses();

const jobRateLimiter = async (req, res, next) => {
  try {
    const { user } = req.user; // verify_token sets req.user = { user }
    const user_id  = user.id;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentJobs = await prisma.job.count({
      where: {
        user_id,
        created_at: { gte: oneHourAgo },
      },
    });

    if (recentJobs >= 5) {
      const response = responses.tooMany_request_response(
        "You can create a maximum of 5 jobs per hour."
      );
      return res.status(response.status.code).json(response);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = jobRateLimiter;
