const express = require("express");
const { login, register, updateUser } = require("../controllers/auth");
const AuthMiddleware = require("../middlewares/auth");
const router = express.Router();
const rateLimiter = require("express-rate-limit");

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, //15 mins
  max: 10,
  message: {
    msg: "Too many requests form this IP , please try again after 15 mins",
  },
});

router.route("/login").post(apiLimiter, login);
router.route("/register").post(apiLimiter, register);
router.route("/updateuser").patch(AuthMiddleware, updateUser);

module.exports = router;
