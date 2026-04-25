import { Request, Response } from "express";
import Applicant from "../models/applicant.model";

// Create applicant (public apply OR save draft)
export const createApplicant = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const isDraft = body.status === "draft";

    const applicantData = {
      ...body,
      name: body.name || body.fullName,
      status: isDraft ? "draft" : "submitted",
      userId: (req as any).userId,
    };

    const applicant = new Applicant(applicantData);
    await applicant.save();

    res.status(201).json({
      success: true,
      message: isDraft ? "Draft saved!" : "Application submitted successfully!",
      data: applicant,
    });
  } catch (error) {
    console.error("Create applicant error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit application", error });
  }
};

// Get ALL applicants OR filter by jobId (HR use)
export const getApplicantsByJob = async (req: Request, res: Response) => {
  try {
    const { jobId, status } = req.query;
    const filter: any = {};
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;

    // HR should not see drafts unless explicitly requested
    if (!status) filter.status = { $ne: "draft" };

    const applicants = await Applicant.find(filter).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: applicants.length, data: applicants });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to get applicants", error });
  }
};

// Get applicant's OWN application by userId (for applicant dashboard)
export const getMyApplication = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const application = await Applicant.findOne({ userId })
      .populate("jobId", "title department")
      .sort({ createdAt: -1 });

    if (!application) {
      res.status(404).json({ success: false, message: "No application found" });
      return;
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get your application",
      error,
    });
  }
};

// Update draft — applicant continues their saved application
export const updateDraft = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { submit } = req.query; // ?submit=true to finalize

    const application = await Applicant.findOneAndUpdate(
      { userId, status: "draft" },
      { ...req.body, status: submit === "true" ? "submitted" : "draft" },
      { new: true },
    );

    if (!application) {
      res.status(404).json({ success: false, message: "No draft found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: submit === "true" ? "Application submitted!" : "Draft updated!",
      data: application,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update draft", error });
  }
};

// Get single applicant by ID (HR use)
export const getApplicantById = async (req: Request, res: Response) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      res.status(404).json({ success: false, message: "Applicant not found" });
      return;
    }
    res.status(200).json({ success: true, data: applicant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to get applicant", error });
  }
};

// Update applicant status (HR use)
export const updateApplicantStatus = async (req: Request, res: Response) => {
  try {
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true },
    );
    if (!applicant) {
      res.status(404).json({ success: false, message: "Applicant not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Updated successfully!",
      data: applicant,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update", error });
  }
};

// Delete applicant
export const deleteApplicant = async (req: Request, res: Response) => {
  try {
    await Applicant.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Applicant deleted!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete", error });
  }
};

// Search applicants (HR use)
export const searchApplicants = async (req: Request, res: Response) => {
  try {
    const { jobId, skills, minExperience, maxExperience, location, education } =
      req.query;
    const filter: any = { status: { $ne: "draft" } };

    if (jobId) filter.jobId = jobId;
    if (skills) {
      const skillsArray = (skills as string).split(",").map((s) => s.trim());
      filter.skills = { $in: skillsArray };
    }
    if (minExperience || maxExperience) {
      filter.experienceYears = {};
      if (minExperience)
        filter.experienceYears.$gte = parseInt(minExperience as string);
      if (maxExperience)
        filter.experienceYears.$lte = parseInt(maxExperience as string);
    }
    if (location)
      filter.location = { $regex: location as string, $options: "i" };
    if (education)
      filter.educationLevel = { $regex: education as string, $options: "i" };

    const applicants = await Applicant.find(filter).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: applicants.length, data: applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed", error });
  }
};
