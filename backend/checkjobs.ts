import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const jobs = await mongoose.connection.collection("jobs").find({}).toArray();
  console.log("JOBS:", JSON.stringify(jobs.map(j => ({ id: j._id, title: j.title })), null, 2));
  
  const sample = await mongoose.connection.collection("applicants").findOne({});
  console.log("SAMPLE jobId:", JSON.stringify(sample?.jobId));
  process.exit();
}
main();
