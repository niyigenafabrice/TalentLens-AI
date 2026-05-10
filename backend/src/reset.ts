import mongoose from "mongoose";
import dotenv from "dotenv";
import Applicant from "./models/applicant.model";
import Job from "./models/job.model";
import Interview from "./models/interview.model";

dotenv.config();

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    await Applicant.deleteMany({});
    console.log("All applicants deleted");

    await Job.deleteMany({});
    console.log("All jobs deleted");

    await Interview.deleteMany({});
    console.log("All interviews deleted");

    console.log("Database reset complete!");
    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  }
};

reset();
