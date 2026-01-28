/** @format */

const { prisma } = require("@configs/prisma");
const TokenService = require("@api/v1/services/token");

const token_service = new TokenService(process.env.JWT_SECRET_KEY);

const verify_token_optional = async (req, res, next) => {
  let access_token = req.headers.authorization;
  
  // If no token provided, just continue without setting req.user
  if (!access_token) {
    return next();
  }

  // Handle "Bearer <token>" format
  if (access_token.startsWith('Bearer ')) {
    access_token = access_token.substring(7);
  }

  // If token provided, verify it
  const id = token_service.verify_access_token(access_token)?.id;
  if (!id) {
    // Token invalid or expired, but don't throw error - let controller handle it
    return next();
  }

  const user = await prisma.users.findFirst({
    where: { id: `${id}` },
  });

  if (user) {
    req.user = { user };
  }
  
  next();
};

module.exports = verify_token_optional;
