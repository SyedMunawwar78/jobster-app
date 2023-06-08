const mongoose = require("mongoose");
const CustomErrorAPI = require("../errors/custom-error");
const Job = require("../models/job");
const { StatusCodes } = require("http-status-codes");
const moment = require("moment");

const getJobs = async (req, res) => {
  const { search, status, jobType, sort } = req.query;

  const queryObj = {
    createdBy: req.user.userID,
  };

  if (search) {
    queryObj.position = { $regex: search, $options: "i" };
  }

  if (status && status !== "all") {
    queryObj.status = status;
  }

  if (jobType && jobType !== "all") {
    queryObj.jobType = jobType;
  }

  let result = Job.find(queryObj);

  if (sort === "latest") {
    result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result.sort("createdAt");
  }
  if (sort === "a-z") {
    result.sort("position");
  }
  if (sort === "z-a") {
    result.sort("-position");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const jobs = await result;
  const totalJobs = await Job.countDocuments(queryObj);
  const numofPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numofPages });
};

const getSingleJob = async (req, res) => {
  const { id: jobID } = req.params;
  const { userID } = req.user;

  const job = await Job.findOne({ _id: jobID, createdBy: userID });
  if (!job) {
    throw new CustomErrorAPI("No Job with this ID", StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json({ job });
};

const updateJob = async (req, res) => {
  const { id: jobID } = req.params;
  const { userID } = req.user;

  const job = await Job.findByIdAndUpdate(
    { _id: jobID, createdBy: userID },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!job) {
    throw new CustomErrorAPI("No Job with this ID", StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userID;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const deleteJob = async (req, res) => {
  const { id: jobID } = req.params;
  const { userID } = req.user;

  const job = await Job.findByIdAndRemove({ _id: jobID, createdBy: userID });
  if (!job) {
    throw new CustomErrorAPI("No Job with this ID", StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json({ job });
};

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userID) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userID) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");

      return { date, count };
    })
    .reverse();

  console.log(monthlyApplications);

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
  getJobs,
  createJob,
  getSingleJob,
  updateJob,
  deleteJob,
  showStats,
};
