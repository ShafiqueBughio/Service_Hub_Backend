const express = require("express");
const PublicController = require("@api/v1/controllers/public");
const PublicValidations = require("@api/v1/validations/public");
const validate_request = require("@api/v1/middlewares/validate_request_joi.middleware");

const router = express.Router();

const controller = new PublicController();
const validations = new PublicValidations();

router.get(
  "/reasons",
  validate_request(validations.get_schema),
  controller.get_all_reasons
);

router.get(
  "/categories",
  validate_request(validations.get_schema_no_query),
  controller.get_all_categories
);

router.get(
  "/professions",
  validate_request(validations.get_schema_no_query),
  controller.get_all_professions
);

router.get(
  "/professions/:profession_id",
  validate_request(validations.get_single_profession_schema),
  controller.get_nested_professions
);

module.exports = router;
