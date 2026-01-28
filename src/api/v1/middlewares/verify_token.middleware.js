/** @format */

const { prisma } = require("@configs/prisma");
const TokenService = require("@api/v1/services/token");
const Responses = require("@constants/responses");

const reponses = new Responses();
const token_service = new TokenService(process.env.JWT_SECRET_KEY);

const verify_token = async (req, res, next) => {
  // Check both lowercase and original case for authorization header
  let access_token = req.headers.authorization || req.headers.Authorization;
  
  if (!access_token) {
    const response = reponses.unauthorized_response(
      "Unauthorized. Access token required. Please provide Authorization header with Bearer token."
    );
    return res.status(response.status.code).json(response);
  }
  
  // Handle "Bearer <token>" format
  if (access_token.startsWith('Bearer ') || access_token.startsWith('bearer ')) {
    access_token = access_token.substring(7);
  }
  
  const id = token_service.verify_access_token(access_token)?.id;
  if (!id) {
    const response = reponses.session_expired_response("Access Token Expired or Invalid.");
    return res.status(response.status.code).json(response);
  }

  const user = await prisma.users.findFirst({
    where: { id: `${id}` },
  });

  if (!user) {
    const response = reponses.unauthorized_response("User not found.");
    return res.status(response.status.code).json(response);
  }
  req.user = { user };
  next();
};

module.exports = verify_token;
