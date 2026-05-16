/** @format */

const AnalyticsService = require("@api/v1/services/analytics");
const Responses = require("@constants/responses");

const responses = new Responses();
const service = new AnalyticsService();

class AnalyticsController {
  get_contractor_analytics = async (req, res, next) => {
    try {
      const { user } = req.user;
      const query = req.query || {};
      const data = await service.get_contractor_analytics(user.id, query);
      const response = responses.ok_response(
        data,
        "Contractor analytics fetched successfully."
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = AnalyticsController;
