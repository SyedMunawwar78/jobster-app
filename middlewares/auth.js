const CustomErrorAPI = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const AuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomErrorAPI("No Token Provided", StatusCodes.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { userID, name } = payload;
    req.user = { userID, name };
    next();
  } catch (error) {
    throw new CustomErrorAPI("Not Authorized", StatusCodes.UNAUTHORIZED);
  }
};

module.exports = AuthMiddleware;
