const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide Name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please Provide Email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please Provie Valid Email Address",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Provide Password"],
    minlength: 6,
  },
  lastname: {
    type: String,
    trim: true,
    maxlength: 20,
    default: "lastname",
  },
  location: {
    type: String,
    trim: true,
    maxlength: 20,
    default: "location",
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userID: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (inputPassword) {
  const isMatch = bcrypt.compare(inputPassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
