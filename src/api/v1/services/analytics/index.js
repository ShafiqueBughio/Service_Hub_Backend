/** @format */

const { prisma } = require("@configs/prisma");

/**
 * Contractor analytics – screenshot hisaab se:
 * 1. Job Success Score (pie): Active %, Pending %, Rejected %
 * 2. Bids Success Rate: Bid on Jobs, Success on Jobs, Proposal Viewed
 * 3. Profile Views: monthly trend (abhi real data nahi to structure + zeros)
 */
class AnalyticsService {
  get_contractor_analytics = async (contractor_id, query = {}) => {
    const period = query.period || "monthly"; // monthly | weekly

    // --- 1. Job Success Score (Active, Pending, Rejected) ---
    const [pending, accepted, rejected] = await Promise.all([
      prisma.bid.count({
        where: { contractor_id, status: "PENDING" },
      }),
      prisma.bid.count({
        where: {
          contractor_id,
          status: "ACCEPTED",
          job: { is_completed: false, is_cancelled: false },
        },
      }),
      prisma.bid.count({
        where: { contractor_id, status: "REJECTED" },
      }),
    ]);

    const totalBids = pending + accepted + rejected;
    const job_success_score = {
      active: totalBids ? Math.round((accepted / totalBids) * 100) : 0,
      pending: totalBids ? Math.round((pending / totalBids) * 100) : 0,
      rejected: totalBids ? Math.round((rejected / totalBids) * 100) : 0,
      counts: { active: accepted, pending, rejected },
      total: totalBids,
    };

    // --- 2. Bids Success Rate ---
    const bidOnJobs = await prisma.bid.count({
      where: { contractor_id },
    });
    const successOnJobs = await prisma.bid.count({
      where: { contractor_id, status: "ACCEPTED" },
    });
    const proposalViewed = await prisma.bid.groupBy({
      by: ["job_id"],
      where: { contractor_id },
      _count: { job_id: true },
    });
    const bids_success_rate = {
      bid_on_jobs: bidOnJobs,
      success_on_jobs: successOnJobs,
      proposal_viewed: proposalViewed.length, // distinct jobs they bid on (proposal = bid per job)
    };

    // --- 3. Profile Views (chart structure; real tracking ke liye baad me table add kar sakte ho) ---
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const profile_views = {
      period,
      data: months.map((month) => ({ month, views: 0 })),
      total: 0,
    };

    return {
      job_success_score,
      bids_success_rate,
      profile_views,
    };
  };
}

module.exports = AnalyticsService;
