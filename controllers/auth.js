const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const CustomErrorAPI = require("../errors/custom-error");
const customErrorAPI = require("../errors/custom-error");

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastname: user.lastname,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomErrorAPI(
      "Please Provide Email and Password",
      StatusCodes.BAD_REQUEST
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    // throw new CustomErrorAPI("Invalid Creds", StatusCodes.UNAUTHORIZED);
    // throw new Error("Invalid Credsssss");
    throw new customErrorAPI("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomErrorAPI("Invalid Password", StatusCodes.UNAUTHORIZED);
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastname: user.lastname,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

const updateUser = async (req, res) => {
  const { email, name, lastname, location } = req.body;
  if (!email || !name || !lastname || !location) {
    throw new CustomErrorAPI(
      "Please provide all values",
      StatusCodes.BAD_REQUEST
    );
  }
  const user = await User.findOne({ _id: req.user.userID });
  user.email = email;
  user.name = name;
  user.lastname = lastname;
  user.location = location;

  await user.save();

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastname: user.lastname,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

module.exports = {
  login,
  register,
  updateUser,
};
