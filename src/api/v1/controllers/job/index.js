/** @format */

const JobService = require("@api/v1/services/job");
const Responses = require("@constants/responses");
const JobEvents = require("@api/v1/socket/job/job.event");

const responses = new Responses();
const service = new JobService();

class JobController {
  create_job = async (req, res, next) => {
    try {
      const { user } = req.user;

      const job = await service.create_job({
        user_id: user.id,
        body: req.body,
      });

      const response = responses.create_success_response(
        job,
        "Job created successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  update_job = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { user } = req.user;

      const job = await service.update_job({
        jobId,
        user_id: user.id,
        body: req.body,
      });

      const response = responses.update_success_response(
        job,
        "Job updated successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_my_jobs = async (req, res, next) => {
    try {
      const { user } = req.user;
      const query = req.query || {};

      const jobs = await service.get_my_jobs(user.id, query);

      const response = responses.ok_response(
        jobs,
        "My jobs fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_my_bids = async (req, res, next) => {
    try {
      const { user } = req.user;
      const query = req.query || {};
      const bids = await service.get_my_bids(user.id, query);
      const response = responses.ok_response(
        bids,
        "My bids fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  mark_job_completed = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { user } = req.user;

      const job = await service.mark_job_completed({ jobId, user_id: user.id });

      const response = responses.ok_response(
        job,
        "Job marked as completed successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  cancel_job = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { user } = req.user;

      const job = await service.cancel_job({ jobId, user_id: user.id });

      const response = responses.ok_response(
        job,
        "Job cancelled successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_single_job = async (req, res, next) => {
    try {
      const { jobId } = req.params;

      const job = await service.get_single_job(jobId);

      const response = responses.ok_response(
        job,
        "Job fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Contractor: list open jobs (Latest Jobs); optional invited_only = pending / requests for me
  get_jobs_list = async (req, res, next) => {
    try {
      const query = req.query || {};
      const contractor_id = req.user?.user?.id || null;
      const jobs = await service.get_jobs_list({ query, contractor_id });
      const response = responses.ok_response(
        jobs,
        "Jobs fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  create_bid = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { user } = req.user;
      const bid = await service.create_bid({
        jobId,
        contractor_id: user.id,
        body: req.body,
      });
      // Real-time: notify everyone in job room (owner + contractors)
      const io = globalThis.io;
      if (io) {
        const roomName = `job-room-${jobId}`;
        io.to(roomName).emit(JobEvents.BID_RECEIVED, bid);
      }
      const response = responses.create_success_response(
        bid,
        "Bid placed successfully. You'll receive updates if your bid is accepted or outbid."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_bids_by_job = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { user } = req.user;
      const result = await service.get_bids_by_job({ jobId, user_id: user.id });
      const response = responses.ok_response(
        result,
        "Bids fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  accept_bid = async (req, res, next) => {
    try {
      const { jobId, bidId } = req.params;
      const { user } = req.user;
      const { final_quote_price, final_timeline_estimate } = req.body || {};
      const acceptedBid = await service.accept_bid({
        jobId,
        bidId,
        user_id: user.id,
        final_quote_price,
        final_timeline_estimate,
      });
      // Real-time: notify everyone in job room
      const io = globalThis.io;
      if (io) {
        const roomName = `job-room-${jobId}`;
        io.to(roomName).emit(JobEvents.BID_ACCEPTED, acceptedBid);
      }
      const response = responses.ok_response(
        acceptedBid,
        "Bid accepted successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  reject_bid = async (req, res, next) => {
    try {
      const { jobId, bidId } = req.params;
      const { user } = req.user;
      const { reason } = req.body || {};
      const updated = await service.reject_bid({
        jobId,
        bidId,
        user_id: user.id,
        reason,
      });
      const io = globalThis.io;
      if (io) {
        const roomName = `job-room-${jobId}`;
        io.to(roomName).emit(JobEvents.BID_REJECTED, { bidId, jobId, reject_reason: updated.reject_reason });
      }
      const response = responses.ok_response(
        updated,
        "Bid rejected successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteJob = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { user } = req.user;

      await service.delete_job({
        jobId,
        user_id: user.id,
      });

      const response = responses.delete_success_response(
        null,
        "Job deleted successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Give Review – user (job owner) rates contractor after job completed (Give Review screen)
  give_review = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { user } = req.user;
      const { rating, review_text } = req.body || {};
      const review = await service.give_review({
        jobId,
        user_id: user.id,
        rating,
        review_text,
      });
      const response = responses.create_success_response(
        review,
        "Review submitted successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_review = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const review = await service.get_review(jobId);
      const response = responses.ok_response(
        review,
        review ? "Review fetched successfully." : null
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_my_reviews = async (req, res, next) => {
    try {
      const { user } = req.user;
      const query = req.query || {};
      const reviews = await service.get_my_reviews(user.id, query);
      const response = responses.ok_response(
        reviews,
        "My ratings and reviews fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_review_by_id = async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { user } = req.user;
      const review = await service.get_review_by_id(reviewId, user.id);
      const response = responses.ok_response(
        review,
        "Review with user and project detail fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = JobController;
