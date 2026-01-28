/** @format */

const TermsAndConditionService = require("@api/v1/services/terms_and_conditions");
const Responses = require("@constants/responses");

const responses = new Responses();
const terms_and_conditions_service = new TermsAndConditionService();

class TermsAndConditionController {
  create_terms_and_condition = async (req, res, next) => {
    try {
      const { terms_and_conditions } =
        await terms_and_conditions_service.create_terms_and_conditions({
          data: req.body,
        });

      const response = responses.ok_response(
        terms_and_conditions,
        "Successfully Saved"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_terms_and_conditions = async (req, res, next) => {
    try {
      const { terms_and_conditions } = await
        terms_and_conditions_service.get_terms_and_conditions();

      const response = responses.ok_response(
        terms_and_conditions,
        "Terms and conditions"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = TermsAndConditionController;
