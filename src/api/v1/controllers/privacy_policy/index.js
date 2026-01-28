/** @format */

const PrivacyPolicyService = require("@api/v1/services/privacy_policy");
const Responses = require("@constants/responses");

const responses = new Responses();
const privacy_policy_service = new PrivacyPolicyService();

class PrivacyPolicyController {
  create_privacy_policy = async (req, res, next) => {
    try {
      const { privacy_policy } =
        await privacy_policy_service.create_privacy_policy({ data: req.body });

      const response = responses.ok_response(
        privacy_policy,
        "Successfully Saved"
      );
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };

  get_privacy_policy = async (req, res, next) => {
    try {
      const { privacy_policy } =
        await privacy_policy_service.get_privacy_policy();

      const response = responses.ok_response(privacy_policy, "Privacy Policy");
      return res.status(response.status.code).json(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = PrivacyPolicyController;
