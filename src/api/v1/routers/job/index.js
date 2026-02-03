/** @format */

const express = require("express");
const verify_token = require("@v1_middlewares/verify_token.middleware");
const validate_request = require("@v1_middlewares/validate_request_joi.middleware");
const JobController = require("@api/v1/controllers/job");
const JobSchema = require("@api/v1/validations/job");

const controller = new JobController();
const validations = new JobSchema();

const router = express.Router();

router.post(
  "/create",
  verify_token,
  validate_request(validations.create_job_schema),
  controller.create_job
);

router.get(
  "/list",
  verify_token,
  validate_request(validations.get_jobs_list_schema),
  controller.get_jobs_list
);

router.get(
  "/my-jobs",
  verify_token,
  validate_request(validations.get_my_jobs_schema),
  controller.get_my_jobs
);

router.get(
  "/my-bids",
  verify_token,
  validate_request(validations.get_my_bids_schema),
  controller.get_my_bids
);

router.get(
  "/:jobId",
  verify_token,
  validate_request(validations.get_job_by_id_schema),
  controller.get_single_job
);

router.post(
  "/:jobId/bid",
  verify_token,
  validate_request(validations.create_bid_schema),
  controller.create_bid
);

router.get(
  "/:jobId/bids",
  verify_token,
  validate_request(validations.get_bids_by_job_schema),
  controller.get_bids_by_job
);

router.post(
  "/:jobId/bid/:bidId/accept",
  verify_token,
  validate_request(validations.accept_bid_schema),
  controller.accept_bid
);

router.patch(
  "/:jobId/mark-completed",
  verify_token,
  validate_request(validations.mark_completed_schema),
  controller.mark_job_completed
);

router.post(
  "/:jobId/review",
  verify_token,
  validate_request(validations.give_review_schema),
  controller.give_review
);

router.get(
  "/:jobId/review",
  verify_token,
  validate_request(validations.get_review_schema),
  controller.get_review
);

router.patch(
  "/:jobId",
  verify_token,
  validate_request(validations.update_job_schema),
  controller.update_job
);

router.delete(
  "/:jobId",
  verify_token,
  validate_request(validations.delete_job_schema),
  controller.deleteJob
);

module.exports = router;
