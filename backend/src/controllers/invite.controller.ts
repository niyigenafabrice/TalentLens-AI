import { Request, Response } from "express";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { email, name, role } = req.body;
    if (!email || !name || !role) {
      res.status(400).json({ success: false, message: "Email, name and role are required" });
      return;
    }

    // Generate invite token valid for 48 hours
    const token = jwt.sign(
      { email, name, role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "48h" }
    );

    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/accept-invite?token=${token}`;

    await transporter.sendMail({
      from: `"TalentLens HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You have been invited to join TalentLens HR Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TalentLens</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">HR Intelligence Platform</p>
          </div>
          <div style="background: #f8faff; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin: 0 0 16px;">Hello ${name}!</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              You have been invited to join <strong>TalentLens HR Platform</strong> as a <strong style="color: #1d4ed8;">${role.replace("_", " ")}</strong>.
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
              Click the button below to set your password and activate your account. This link expires in 48 hours.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            <div style="background: white; border-radius: 10px; padding: 16px 20px; border: 1px solid #e2e8f0;">
              <div style="font-size: 12px; color: "#94a3b8"; margin-bottom: 8px; font-weight: 600;">YOUR ACCOUNT DETAILS</div>
              <div style="font-size: 14px; color: #374151;"><strong>Name:</strong> ${name}</div>
              <div style="font-size: 14px; color: #374151; margin-top: 4px;"><strong>Email:</strong> ${email}</div>
              <div style="font-size: 14px; color: #374151; margin-top: 4px;"><strong>Role:</strong> ${role.replace("_", " ")}</div>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; text-align: center;">
              If you did not expect this invitation, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #1e3a8a; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">TalentLens HR Intelligence Platform</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error: any) {
    console.error("Invite error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send invitation", error: error.message });
  }
};
