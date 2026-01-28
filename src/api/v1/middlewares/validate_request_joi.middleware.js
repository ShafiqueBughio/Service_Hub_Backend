const { logger } = require("@configs/logger");
const Responses = require("@constants/responses");

const responses = new Responses();

const validate_request = (schema) => (req, res, next) => {
  const { body, params, query } = req;
  try {
    const { error } = schema.validate(
      { body, params, query },
      { abortEarly: false }
    );
    if (error) {
      const errorMessage = error.details.map((err) => err.message);
      const response = responses.bad_request_response(errorMessage);
      return res.status(response.status.code).json(response);
    }
    next();
  } catch (error) {
    logger.error(error);
  }
};

module.exports = validate_request;
