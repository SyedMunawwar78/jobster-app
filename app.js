require("dotenv").config();
require("express-async-errors");
// Security packages
const helmet = require("helmet");
const xss = require("xss-clean");

const express = require("express");
const app = express();

// Connect DB
const connectDB = require("./db/connect");
//Routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

// Error Handlers
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

//Auth
const AuthMiddleware = require("./middlewares/auth");

// Path module for serving static frontend (react)
const path = require("path");

app.set("trust proxy", 1);
app.use(express.static(path.resolve(__dirname, "./client/build")));
app.use(express.json());
app.use(helmet());
app.use(xss());

//Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", AuthMiddleware, jobsRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
