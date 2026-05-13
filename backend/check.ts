import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const statuses = await mongoose.connection.collection("applicants").aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();
  console.log("STATUSES:", JSON.stringify(statuses, null, 2));
  
  const sample = await mongoose.connection.collection("applicants").findOne({});
  console.log("jobId value:", JSON.stringify(sample?.jobId));
  console.log("jobId type:", typeof sample?.jobId);
  process.exit();
}
main();
