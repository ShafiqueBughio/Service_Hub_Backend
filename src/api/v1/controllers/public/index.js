const PublicService = require("@api/v1/services/public");
const Responses = require("@constants/responses");

const service = new PublicService();
const responses = new Responses();

class PublicController {
  get_all_reasons = async (req, res, next) => {
    try {
      const { type } = req.query;

      const data = await service.get_reasons({ type });
      const response = responses.ok_response(
        data,
        "Successfully fetech reason"
      );
      return res.status(response.status.code).send(response);
    } catch (error) {
      next(error);
    }
  };
  get_all_categories = async (_, res, next) => {
    try {
      const data = await service.get_categories({});
      const response = responses.ok_response(
        data,
        "Successfully fetech categories"
      );
      return res.status(response.status.code).send(response);
    } catch (error) {
      next(error);
    }
  };

  get_all_professions = async (_, res, next) => {
    try {
      const data = await service.get_professions({});
      const response = responses.ok_response(
        data,
        "Successfully fetech professions"
      );
      return res.status(response.status.code).send(response);
    } catch (error) {
      next(error);
    }
  };

  get_nested_professions = async (req, res, next) => {
    try {
      const { profession_id } = req.params;

      const data = await service.get_single_nested_profession({
        profession_id,
      });
      const response = responses.ok_response(
        data,
        "Successfully fetched single profession"
      );
      return res.status(response.status.code).send(response);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = PublicController;
