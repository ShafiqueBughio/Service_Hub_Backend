/** @format */

const Joi = require("joi");

const EXPIRE_DAYS_OPTIONS = [1, 3, 5, 7];
const JOB_TYPES = ["REGULAR", "LIVE"];

class JobSchema {
  create_job_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      job_type: Joi.string().valid(...JOB_TYPES).optional(), // Auto: <=2000 REGULAR, 2001+ LIVE
      title: Joi.string().trim().min(1).max(255).required(),
      description: Joi.string().trim().min(1).required(),
      expire_days: Joi.number()
        .integer()
        .valid(...EXPIRE_DAYS_OPTIONS)
        .required(),
      min_budget: Joi.number().min(0).required(),
      max_budget: Joi.number().min(0).required(),
      timeline: Joi.string().trim().max(500).optional(),
      location: Joi.string().trim().max(500).optional(),
      provider_preferences: Joi.array()
        .items(Joi.string().trim().max(100))
        .min(1)
        .optional(),
      attachments: Joi.array()
        .items(
          Joi.object({
            type: Joi.string().valid("image", "video", "pdf", "file").optional(),
            url: Joi.string().min(1).required(), // URL or presigned URL
          })
        )
        .optional(),
      // Completed job se "Request Service" – is contractor k pending me jata he
      invited_contractor_id: Joi.string().uuid().optional(),
    }),
  });

  update_job_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      job_type: Joi.string().valid(...JOB_TYPES).optional(),
      title: Joi.string().trim().min(1).max(255).optional(),
      description: Joi.string().trim().min(1).optional(),
      expire_days: Joi.number()
        .integer()
        .valid(...EXPIRE_DAYS_OPTIONS)
        .optional(),
      min_budget: Joi.number().min(0).optional(),
      max_budget: Joi.number().min(0).optional(),
      timeline: Joi.string().trim().max(500).optional(),
      location: Joi.string().trim().max(500).optional(),
      provider_preferences: Joi.array()
        .items(Joi.string().trim().max(100))
        .optional(),
      attachments: Joi.array()
        .items(
          Joi.object({
            type: Joi.string().valid("image", "video", "pdf", "file").optional(),
            url: Joi.string().min(1).required(), // URL or presigned URL
          })
        )
        .optional(),
      status: Joi.string().valid("OPEN", "CLOSED").optional(),
    }),
  });

  get_job_by_id_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });

  // User: My Projects – optional tab = pending | active | completed
  get_my_jobs_schema = Joi.object({
    query: Joi.object({
      tab: Joi.string().valid("pending", "active", "completed", "cancelled").optional(),
    }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  // Contractor: My Bids – tab = pending | active | past, type = REGULAR | LIVE (lowercase bhi chalega)
  get_my_bids_schema = Joi.object({
    query: Joi.object({
      tab: Joi.string().valid("pending", "active", "past").optional(),
      type: Joi.string().valid("REGULAR", "LIVE", "regular", "live").optional(),
    }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  mark_completed_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });

  cancel_job_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });

  // Contractor: list open jobs (optional filters); invited_only = sirf "Request Service" wali jobs (pending)
  get_jobs_list_schema = Joi.object({
    query: Joi.object({
      search: Joi.string().trim().max(255).optional(),
      location: Joi.string().trim().max(255).optional(),
      job_type: Joi.string().valid(...JOB_TYPES).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
      invited_only: Joi.boolean().optional(), // true = sirf jobs jahan user ko invite kiya (pending / requests for me)
    }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  delete_job_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });

  // --- BID ---
  create_bid_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      quote_price: Joi.number().min(0).required(),
      timeline_estimate: Joi.string().trim().max(255).optional(),
      notes: Joi.string().trim().max(5000).optional(),
      proposal_documents: Joi.array()
        .items(Joi.string().trim().max(2000))
        .optional(),
    }),
  });

  get_bids_by_job_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });

  accept_bid_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
      bidId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      // User finalizes with contractor in chat, then sends these when accepting (modal: Price + Timeline)
      final_quote_price: Joi.number().min(0).optional(),
      final_timeline_estimate: Joi.string().trim().max(255).optional(),
    }),
  });

  // User reject bid – contractor ko Past me "Rejected" dikhega, reason optional (Reject Reason screen)
  reject_bid_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
      bidId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      reason: Joi.string().trim().max(2000).optional().allow(""),
    }),
  });

  // Give Review – job owner (user) rates contractor after job completed (1-5 stars + optional text)
  give_review_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      review_text: Joi.string().trim().max(2000).optional().allow(""),
    }),
  });

  get_review_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      jobId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });

  get_my_reviews_schema = Joi.object({
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).optional(),
      offset: Joi.number().integer().min(0).optional(),
    }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  get_review_by_id_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({
      reviewId: Joi.string().uuid().required(),
    }),
    body: Joi.object({}),
  });
}

module.exports = JobSchema;
