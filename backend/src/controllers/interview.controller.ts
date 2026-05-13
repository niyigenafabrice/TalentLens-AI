import { Request, Response } from "express";
import Interview from "../models/interview.model";
import Applicant from "../models/applicant.model";
import Job from "../models/job.model";
import { sendInterviewInvitationEmail, sendRejectionEmail } from "../email.service";
import { logActivity } from "../utils/logActivity";

export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const interviewData = {
      applicantId: body.applicantId || undefined,
      jobId: body.jobId || undefined,
      scheduledDate: body.scheduledDate || body.date,
      scheduledTime: body.scheduledTime || body.time || "",
      interviewType: body.interviewType || body.type || "online",
      interviewerName: body.interviewerName || body.interviewers || "",
      interviewers: body.interviewers || body.interviewerName || "",
      location: body.location || "",
      meetingLink: body.meetingLink || "",
      status: body.status || "scheduled",
      notes: body.notes || "",
    };

    const interview = new Interview(interviewData);
    await interview.save();

    // Update applicant status to shortlisted
    if (interviewData.applicantId) {
      await Applicant.findByIdAndUpdate(interviewData.applicantId, { status: "shortlisted" });
    }

    // Send interview invitation email to candidate
    try {
      const applicant = await Applicant.findById(interviewData.applicantId);
      const job = await Job.findById(interviewData.jobId);

      if (applicant && job) {
        await sendInterviewInvitationEmail(
          applicant.fullName || applicant.name,
          applicant.email,
          job.title,
          interviewData.scheduledDate,
          interviewData.scheduledTime,
          interviewData.interviewType,
          interviewData.meetingLink || undefined,
          interviewData.notes || undefined
        );
        console.log(`Interview invitation sent to ${applicant.email}`);
      }
    } catch (emailError) {
      console.error("Email send failed (interview still saved):", emailError);
    }

    const scheduledApplicant = await Applicant.findById(interviewData.applicantId);
    const scheduledJob = await Job.findById(interviewData.jobId);
    if (scheduledApplicant && scheduledJob) {
      await logActivity(
        "Interview scheduled",
        "interview",
        `Interview scheduled for ${scheduledApplicant.fullName || scheduledApplicant.name} for ${scheduledJob.title} on ${interviewData.scheduledDate} at ${interviewData.scheduledTime}`,
        "calendar",
        "#7c3aed"
      );
    }
    res.status(201).json({
      success: true,
      message: "Interview scheduled and invitation email sent!",
      data: interview,
    });
  } catch (error: any) {
    console.error("Schedule interview error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};

export const getInterviewsByJob = async (req: Request, res: Response) => {
  try {
    const interviews = await Interview.find({ jobId: req.params.jobId })
      .populate("applicantId", "name fullName email phone")
      .sort({ scheduledDate: 1 });
    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to get interviews", error: error.message });
  }
};

export const getAllInterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await Interview.find()
      .populate("applicantId", "name fullName email phone skills yearsOfExperience educationLevel")
      .populate("jobId", "title department location")
      .sort({ scheduledDate: 1 });

    const mapped = interviews.map((iv: any) => ({
      ...iv.toObject(),
      date: iv.scheduledDate,
      time: iv.scheduledTime,
      type: iv.interviewType,
      interviewers: iv.interviewers || iv.interviewerName,
    }));

    res.status(200).json({ success: true, count: mapped.length, data: mapped });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to get interviews", error: error.message });
  }
};

export const updateInterview = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const updateData: any = { ...body };
    if (body.date) updateData.scheduledDate = body.date;
    if (body.time) updateData.scheduledTime = body.time;
    if (body.type) updateData.interviewType = body.type;
    if (body.interviewers) updateData.interviewerName = body.interviewers;

    const interview = await Interview.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!interview) {
      res.status(404).json({ success: false, message: "Interview not found" });
      return;
    }

    const result: any = interview.toObject();
    result.date = result.scheduledDate;
    result.time = result.scheduledTime;
    result.type = result.interviewType;

    res.status(200).json({ success: true, message: "Interview updated!", data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to update interview", error: error.message });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Interview deleted!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to delete interview", error: error.message });
  }
};

export const rejectApplicant = async (req: Request, res: Response) => {
  try {
    const { applicantId, jobId } = req.body;

    await Applicant.findByIdAndUpdate(applicantId, { status: "rejected" });

    // Send rejection email
    try {
      const applicant = await Applicant.findById(applicantId);
      const job = await Job.findById(jobId);
      if (applicant && job) {
        await sendRejectionEmail(
          applicant.fullName || applicant.name,
          applicant.email,
          job.title
        );
        console.log(`Rejection email sent to ${applicant.email}`);
      }
    } catch (emailError) {
      console.error("Rejection email failed:", emailError);
    }

    res.status(200).json({ success: true, message: "Applicant rejected and notified by email." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to reject applicant", error: error.message });
  }
};



