/** @format */
const { prisma } = require("@configs/prisma");

class JobService {
  // Save bid to DB (same logic as API: one PENDING bid per contractor per job, update or create)
  submitBid = async ({
    jobId,
    contractorId,
    quotePrice,
    timeline,
    note,
    proposalUrl,
    proposal_documents,
  }) => {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, user_id: true, status: true },
    });
    if (!job) throw new Error("Job not found");
    if (job.status !== "OPEN") throw new Error("Job is not open for bidding");
    if (job.user_id === contractorId) throw new Error("You cannot bid on your own job");

    const docs = Array.isArray(proposal_documents)
      ? proposal_documents.filter(Boolean)
      : proposalUrl
        ? [proposalUrl]
        : [];

    const existing = await prisma.bid.findFirst({
      where: { job_id: jobId, contractor_id: contractorId, status: "PENDING" },
    });

    const data = {
      quote_price: Number(quotePrice),
      timeline_estimate: timeline || null,
      notes: note || null,
      proposal_documents: docs.length ? docs : null,
    };

    const bid = existing
      ? await prisma.bid.update({
          where: { id: existing.id },
          data,
          include: this.#bidInclude(),
        })
      : await prisma.bid.create({
          data: {
            job_id: jobId,
            contractor_id: contractorId,
            ...data,
          },
          include: this.#bidInclude(),
        });

    return bid;
  };

  #bidInclude = () => ({
    contractor: {
      select: {
        id: true,
        user_details: {
          select: {
            first_name: true,
            last_name: true,
            location: true,
            profile_picture: true,
          },
        },
      },
    },
  });

  // Get bids for job (for AUCTION_MEMBERS in live view)
  getBidsForJob = async (jobId) => {
    const bids = await prisma.bid.findMany({
      where: { job_id: jobId },
      orderBy: [{ status: "asc" }, { quote_price: "asc" }, { created_at: "asc" }],
      include: this.#bidInclude(),
    });
    return bids;
  };

  getJobOwnerId = async (jobId) => {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Job not found");
    return job.user_id;
  };
}

module.exports = new JobService();
