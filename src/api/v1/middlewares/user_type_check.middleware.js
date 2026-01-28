const Responses = require("@constants/responses");

const responses = new Responses();

const user_type_check = (user_type) => async (req, res, next) => {
  const { user } = req.user;
  if (user.user_type != user_type) {
    const response = responses.bad_request_response(
      `This route can only access by ${user_type}`
    );
    return res.status(response.status.code).json(response);
  }
  next();
};

module.exports = user_type_check;
