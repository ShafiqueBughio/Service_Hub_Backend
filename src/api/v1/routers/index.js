const express = require("express");
const error_middleware = require("@v1_middlewares/error_handler.middleware");
const router = express.Router();

const about_app_router = require("./about_app");
const help_and_feedback_router = require("./help_and_feedback");
const privacy_policy_router = require("./privacy_policy");
const term_and_conditions_router = require("./terms_and_conditions");

const chat_router = require("./chat");
const notification_router = require("./notifications");

const user_router = require("./user");
const presigned_url_router = require("./presigned_url");

const public_router = require("./public");
const job_router = require("./job");
const analytics_router = require("./analytics");

/**@PRIVATE */
router.use("/user", user_router);
router.use("/analytics", analytics_router);
router.use("/notifications", notification_router);
router.use("/chat", chat_router);
router.use("/presigned-url", presigned_url_router);
router.use("/job", job_router);

/**@PUBLIC */
router.use("/help_and_feedback", help_and_feedback_router);
router.use("/privacy_policy", privacy_policy_router);
router.use("/terms_and_conditions", term_and_conditions_router);
router.use("/about-app", about_app_router);

/**@SEEDING_DATA */
router.use("/public", public_router);

router.get("/", (_, res) => {
  try {
    res.send("server working of v1 router -- Share berry");
  } catch (error) {
    res.send(error.message);
  }
});

router.use(error_middleware);

module.exports = router;
