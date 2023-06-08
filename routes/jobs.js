const express = require("express");
const {
  getJobs,
  createJob,
  getSingleJob,
  updateJob,
  deleteJob,
  showStats,
} = require("../controllers/jobs");
const router = express.Router();

router.route("/").get(getJobs).post(createJob);
router.route("/stats").get(showStats);
router.route("/:id").get(getSingleJob).patch(updateJob).delete(deleteJob);

module.exports = router;
