/** @format */

const { prisma } = require("@configs/prisma");
const Responses = require("@constants/responses");

const responses = new Responses();

class JobService {
  create_job = async ({ user_id, body }) => {
    const {
      job_type,
      title,
      description,
      min_budget,
      max_budget,
      expire_days,
      timeline,
      location,
      provider_preferences,
      attachments: clientAttachments,
      invited_contractor_id,
    } = body;

    const minB = Number(min_budget);
    const maxB = Number(max_budget);
    if (minB > maxB) {
      throw responses.bad_request_response(
        "min_budget must be less than or equal to max_budget"
      );
    }

    // Body me job_type di ho to use karo, warna max_budget se auto: 2000 tak REGULAR, 2001+ LIVE
    const jobType =
      job_type === "REGULAR" || job_type === "LIVE"
        ? job_type
        : maxB <= 2000
          ? "REGULAR"
          : "LIVE";

    const attachments = [];
    if (clientAttachments && Array.isArray(clientAttachments)) {
      clientAttachments.forEach((a) => {
        attachments.push({
          type: a.type || "file",
          url: typeof a.url === "string" ? a.url : a.url,
        });
      });
    }

    const job = await prisma.job.create({
      data: {
        user_id,
        job_type: jobType,
        title: title.trim(),
        description: description.trim(),
        min_budget: minB,
        max_budget: maxB,
        expire_days: Number(expire_days),
        timeline: timeline ? timeline.trim() : null,
        location: location ? location.trim() : null,
        provider_preferences: provider_preferences || [],
        attachments,
        ...(invited_contractor_id ? { invited_contractor_id } : {}),
      },
    });
    return job;
  };

  update_job = async ({ jobId, user_id, body }) => {
    const job = await prisma.job.findFirst({
      where: { id: jobId, user_id },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }

    const {
      job_type,
      title,
      description,
      min_budget,
      max_budget,
      expire_days,
      timeline,
      location,
      provider_preferences,
      attachments: clientAttachments,
      status,
    } = body;

    if (
      min_budget != null &&
      max_budget != null &&
      Number(min_budget) > Number(max_budget)
    ) {
      throw responses.bad_request_response(
        "min_budget must be less than or equal to max_budget"
      );
    }

    const updateData = {};
    // Auto job_type on update: 2000 tak REGULAR, 2001 ya upar LIVE
    if (max_budget !== undefined) {
      const maxB = Number(max_budget);
      updateData.job_type = maxB <= 2000 ? "REGULAR" : "LIVE";
    } else if (job_type !== undefined) {
      updateData.job_type = job_type;
    }
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (expire_days !== undefined) updateData.expire_days = Number(expire_days);
    if (min_budget !== undefined) updateData.min_budget = Number(min_budget);
    if (max_budget !== undefined) updateData.max_budget = Number(max_budget);
    if (timeline !== undefined) updateData.timeline = timeline.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (provider_preferences !== undefined)
      updateData.provider_preferences = provider_preferences;
    if (status !== undefined) updateData.status = status;

    if (clientAttachments !== undefined && Array.isArray(clientAttachments)) {
      const existingAttachments = (job.attachments || []);
      const newAttachments = clientAttachments.map((a) => ({
        type: a.type || "file",
        url: typeof a.url === "string" ? a.url : a.url,
      }));
      updateData.attachments = [...existingAttachments, ...newAttachments];
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    return updatedJob;
  };

  // tab = pending | active | completed (for My Projects screen)
  get_my_jobs = async (user_id, query = {}) => {
    const { tab } = query;
    const where = { user_id };

    if (tab === "pending") {
      where.status = "OPEN";
      where.is_cancelled = false;
    } else if (tab === "active") {
      where.status = "CLOSED";
      where.accepted_bid_id = { not: null };
      where.is_completed = false;
      where.is_cancelled = false;
    } else if (tab === "completed") {
      where.is_completed = true;
    } else if (tab === "cancelled") {
      where.is_cancelled = true;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        _count: { select: { bids: true } },
        accepted_bid: {
          select: {
            id: true,
            quote_price: true,
            timeline_estimate: true,
            contractor_id: true,
            contractor: {
              select: {
                id: true,
                user_details: {
                  select: {
                    first_name: true,
                    last_name: true,
                    profile_picture: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return jobs;
  };

  get_single_job = async (jobId) => {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            user_type: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
                profile_picture: true,
                contact_phone: true,
              },
            },
          },
        },
        accepted_bid: {
          select: {
            id: true,
            quote_price: true,
            timeline_estimate: true,
            notes: true,
            proposal_documents: true,
            contractor_id: true,
            contractor: {
              select: {
                id: true,
                user_details: {
                  select: {
                    first_name: true,
                    last_name: true,
                    profile_picture: true,
                    contact_phone: true,
                  },
                },
              },
            },
          },
        },
        _count: { select: { bids: true } },
      },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    return job;
  };

  mark_job_completed = async ({ jobId, user_id }) => {
    const job = await prisma.job.findFirst({
      where: { id: jobId, user_id },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    if (!job.accepted_bid_id) {
      throw responses.bad_request_response("No bid accepted for this job.");
    }
    if (job.is_completed) {
      throw responses.bad_request_response("Job is already marked as completed.");
    }
    await prisma.job.update({
      where: { id: jobId },
      data: { is_completed: true },
    });
    return await this.get_single_job(jobId);
  };

  cancel_job = async ({ jobId, user_id }) => {
    const job = await prisma.job.findFirst({
      where: { id: jobId, user_id },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    if (job.is_completed) {
      throw responses.bad_request_response("Completed job cannot be cancelled.");
    }
    if (job.is_cancelled) {
      throw responses.bad_request_response("Job is already cancelled.");
    }
    await prisma.job.update({
      where: { id: jobId },
      data: { is_cancelled: true },
    });
    return await this.get_single_job(jobId);
  };

  delete_job = async ({ jobId, user_id }) => {
    const job = await prisma.job.findFirst({
      where: { id: jobId, user_id },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    await prisma.job.delete({ where: { id: jobId } });
    return true;
  };

  // --- Contractor: list open jobs (Latest Jobs); invited_only = pending / "Request Service" wali jobs ---
  get_jobs_list = async ({ query = {}, contractor_id } = {}) => {
    const { search, location, job_type, limit = 20, offset = 0, invited_only } = query;
    const invitedOnly = invited_only === true || invited_only === "true";

    // Pending / "Request Service" wali jobs: raw query use karte hain (Prisma client me field na ho to bhi chal jaye)
    if (invitedOnly && contractor_id) {
      const ids = await prisma.$queryRaw`
        SELECT id FROM jobs
        WHERE status = 'OPEN' AND is_cancelled = 0 AND invited_contractor_id = ${contractor_id}
        ORDER BY created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
      const idList = (ids || []).map((r) => r.id);
      if (idList.length === 0) return [];
      const jobs = await prisma.job.findMany({
        where: { id: { in: idList } },
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: {
              id: true,
              user_details: {
                select: { first_name: true, last_name: true, location: true },
              },
            },
          },
        },
      });
      return jobs.map((j) => ({ ...j, requested_for_you: true }));
    }

    const where = { status: "OPEN", is_cancelled: false };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (location) where.location = { contains: location };
    if (job_type) where.job_type = job_type;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: Number(limit),
      skip: Number(offset),
      include: {
        user: {
          select: {
            id: true,
            user_details: {
              select: { first_name: true, last_name: true, location: true },
            },
          },
        },
      },
    });
    return jobs;
  };

  // --- BID ---
  create_bid = async ({ jobId, contractor_id, body }) => {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    if (job.status !== "OPEN") {
      throw responses.bad_request_response("Job is not open for bidding.");
    }
    if (job.user_id === contractor_id) {
      throw responses.bad_request_response("You cannot bid on your own job.");
    }

    const { quote_price, timeline_estimate, notes, proposal_documents } = body;
    const proposalDocs = Array.isArray(proposal_documents)
      ? proposal_documents.filter(Boolean)
      : [];

    // One active bid per contractor per job: update if exists, else create
    const existing = await prisma.bid.findFirst({
      where: { job_id: jobId, contractor_id, status: "PENDING" },
    });

    let bid;
    if (existing) {
      bid = await prisma.bid.update({
        where: { id: existing.id },
        data: {
          quote_price: Number(quote_price),
          timeline_estimate: timeline_estimate || null,
          notes: notes || null,
          proposal_documents: proposalDocs.length ? proposalDocs : null,
        },
        include: {
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
        },
      });
    } else {
      bid = await prisma.bid.create({
        data: {
          job_id: jobId,
          contractor_id,
          quote_price: Number(quote_price),
          timeline_estimate: timeline_estimate || null,
          notes: notes || null,
          proposal_documents: proposalDocs.length ? proposalDocs : null,
        },
        include: {
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
        },
      });
    }
    return bid;
  };

  get_bids_by_job = async ({ jobId, user_id }) => {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, user_id: true, status: true },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    // Job owner or any contractor can see bids (for live auction members list)
    const bids = await prisma.bid.findMany({
      where: { job_id: jobId },
      orderBy: [{ status: "asc" }, { quote_price: "asc" }, { created_at: "asc" }],
      include: {
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
      },
    });
    return { job, bids };
  };

  // --- Contractor: My Bids (Regular Bid | Live Bid → Pending | Active | Past) ---
  get_my_bids = async (contractor_id, query = {}) => {
    let { tab, type } = query;
    type = type ? String(type).toUpperCase() : undefined; // "regular" / "REGULAR" dono
    const where = { contractor_id };
    const jobFilter = {};
    if (type === "REGULAR") jobFilter.job_type = "REGULAR";
    if (type === "LIVE") jobFilter.job_type = "LIVE";

    const jobSelect = {
      id: true,
      title: true,
      description: true,
      job_type: true,
      status: true,
      min_budget: true,
      max_budget: true,
      timeline: true,
      location: true,
      created_at: true,
      is_completed: true,
      is_cancelled: true,
      user_id: true,
      user: {
        select: {
          id: true,
          user_details: {
            select: {
              first_name: true,
              last_name: true,
              profile_picture: true,
              location: true,
            },
          },
        },
      },
    };

    if (tab === "pending") {
      where.status = "PENDING";
      where.job = { status: "OPEN", ...jobFilter };
    } else if (tab === "active") {
      where.status = "ACCEPTED";
      where.job = { status: "CLOSED", is_completed: false, is_cancelled: false, ...jobFilter };
    } else if (tab === "past") {
      where.OR = [
        { status: "REJECTED", ...(Object.keys(jobFilter).length ? { job: jobFilter } : {}) },
        {
          status: "ACCEPTED",
          job: { is_completed: true, ...jobFilter },
        },
        { job: { is_cancelled: true, ...jobFilter } },
      ];
    } else if (Object.keys(jobFilter).length) {
      where.job = jobFilter;
    }

    const bids = await prisma.bid.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        job: {
          select: jobSelect,
        },
      },
    });

    // Pending tab: user ne "Request Service" ki ho (invited_contractor_id) lekin contractor ne abhi bid nahi lagayi – wo bhi list me lao
    if (tab === "pending") {
      const jobIdsWithBid = bids.map((b) => b.job_id);
      const invitedWhere = {
        invited_contractor_id: contractor_id,
        status: "OPEN",
        is_cancelled: false,
        ...jobFilter,
        ...(jobIdsWithBid.length > 0 ? { id: { notIn: jobIdsWithBid } } : {}),
      };
      const invitedJobs = await prisma.job.findMany({
        where: invitedWhere,
        orderBy: { created_at: "desc" },
        select: jobSelect,
      });
      for (const job of invitedJobs) {
        bids.push({
          id: null,
          job_id: job.id,
          contractor_id,
          quote_price: null,
          timeline_estimate: null,
          notes: null,
          proposal_documents: null,
          status: "PENDING",
          reject_reason: null,
          created_at: job.created_at,
          updated_at: job.updated_at,
          job,
          invited_only: true, // Request Service – abhi bid nahi lagayi, isliye pending me dikhao
        });
      }
      // Sort by created_at desc so recent (invited + bids) upar
      bids.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return bids;
  };

  accept_bid = async ({ jobId, bidId, user_id, final_quote_price, final_timeline_estimate }) => {
    const job = await prisma.job.findFirst({
      where: { id: jobId, user_id },
      include: { bids: true },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    if (job.status !== "OPEN") {
      throw responses.bad_request_response("Job is already closed.");
    }
    const bid = await prisma.bid.findFirst({
      where: { id: bidId, job_id: jobId },
    });
    if (!bid) {
      throw responses.not_found_response("Bid not found.");
    }

    // User finalizes price/timeline with contractor in chat; optional body updates accepted bid
    const acceptedBidData = { status: "ACCEPTED" };
    if (final_quote_price != null) acceptedBidData.quote_price = final_quote_price;
    if (final_timeline_estimate != null && final_timeline_estimate !== "") acceptedBidData.timeline_estimate = final_timeline_estimate;

    await prisma.$transaction([
      prisma.bid.updateMany({
        where: { job_id: jobId },
        data: { status: "REJECTED" },
      }),
      prisma.bid.update({
        where: { id: bidId },
        data: acceptedBidData,
      }),
      prisma.job.update({
        where: { id: jobId },
        data: { status: "CLOSED", accepted_bid_id: bidId },
      }),
    ]);

    const acceptedBid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        contractor: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
                contact_phone: true,
              },
            },
          },
        },
      },
    });
    return acceptedBid;
  };

  // User reject bid – contractor Past me "Rejected" + reject_reason dikhega (Reject Reason screen)
  reject_bid = async ({ jobId, bidId, user_id, reason }) => {
    const job = await prisma.job.findFirst({
      where: { id: jobId, user_id },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    if (job.status !== "OPEN") {
      throw responses.bad_request_response("Job is already closed.");
    }
    const bid = await prisma.bid.findFirst({
      where: { id: bidId, job_id: jobId },
    });
    if (!bid) {
      throw responses.not_found_response("Bid not found.");
    }
    if (bid.status !== "PENDING") {
      throw responses.bad_request_response("Bid is already accepted or rejected.");
    }
    const updated = await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: "REJECTED",
        reject_reason: reason && reason.trim() ? reason.trim() : null,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            job_type: true,
          },
        },
        contractor: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });
    return updated;
  };

  // Give Review – user (job owner) rates contractor after job completed (Give Review screen)
  give_review = async ({ jobId, user_id, rating, review_text }) => {
    const job = await prisma.job.findFirst({
      where: { id: jobId, user_id },
      include: { accepted_bid: true },
    });
    if (!job) {
      throw responses.not_found_response("Job not found.");
    }
    if (job.status !== "CLOSED" || !job.accepted_bid_id) {
      throw responses.bad_request_response("Job must be completed with an accepted bid before giving a review.");
    }
    if (!job.is_completed) {
      throw responses.bad_request_response("Job must be marked as completed before giving a review.");
    }
    const existing = await prisma.review.findUnique({
      where: { job_id: jobId },
    });
    if (existing) {
      throw responses.bad_request_response("You have already given a review for this job.");
    }
    const contractor_id = job.accepted_bid.contractor_id;
    const review = await prisma.review.create({
      data: {
        job_id: jobId,
        reviewer_id: user_id,
        contractor_id,
        rating: Number(rating),
        review_text: review_text && review_text.trim() ? review_text.trim() : null,
      },
      include: {
        contractor: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });
    return review;
  };

  get_review = async (jobId) => {
    const review = await prisma.review.findUnique({
      where: { job_id: jobId },
      include: {
        reviewer: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        contractor: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });
    return review;
  };

  // My Rating & Review list – contractor ke saari reviews (konse job pe konsa rating)
  get_my_reviews = async (contractor_id, query = {}) => {
    const { limit = 20, offset = 0 } = query;
    const reviews = await prisma.review.findMany({
      where: { contractor_id },
      orderBy: { created_at: "desc" },
      take: Math.min(Number(limit) || 20, 100),
      skip: Number(offset) || 0,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            is_completed: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
                profile_picture: true,
              },
            },
          },
        },
      },
    });
    return reviews;
  };

  // Get review by ID – under ka user (reviewer) + project (job) full detail
  get_review_by_id = async (reviewId, user_id) => {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            is_completed: true,
            min_budget: true,
            max_budget: true,
            timeline: true,
            location: true,
            job_type: true,
            created_at: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
                profile_picture: true,
                location: true,
              },
            },
          },
        },
        contractor: {
          select: {
            id: true,
            user_details: {
              select: {
                first_name: true,
                last_name: true,
                profile_picture: true,
              },
            },
          },
        },
      },
    });
    if (!review) throw responses.not_found_response("Review not found.");
    // Only reviewer (job owner), contractor (who received), or admin can view
    if (review.reviewer_id !== user_id && review.contractor_id !== user_id) {
      throw responses.forbidden_response("You cannot view this review.");
    }
    return review;
  };
}

module.exports = JobService;
