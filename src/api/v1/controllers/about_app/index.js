/** @format */

const AboutAppService = require("@api/v1/services/about_app");
const Responses = require("@constants/responses");

const responses = new Responses();
const about_app_service = new AboutAppService();

class AboutAppController {
  create_about_app = async (req, res, next) => {
    console.log(req.body, "..");

    try {
      const { about_app } = await about_app_service.create_about_app({
        data: req.body,
      });

      const response = responses.ok_response(about_app, "Successfully Saved");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_about_app = async (req, res, next) => {
    try {
      const { about_app } = await about_app_service.get_about_app();

      const response = responses.ok_response(about_app, "About App");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}
module.exports = AboutAppController;
