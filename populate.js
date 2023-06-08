const connectDB = require("./db/connect");
const job = require("./models/job");
const jobsMockData = require("./MOCK_DATA.json");
require("dotenv").config();

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    // await job.deleteMany();
    await job.create(jobsMockData);
    console.log("Success");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
