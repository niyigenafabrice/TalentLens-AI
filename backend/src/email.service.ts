import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendNewApplicantEmail = async (applicantName: string, jobTitle: string, applicantEmail: string) => {
  try {
    await transporter.sendMail({
      from: `"TalentLens HR" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Applicant: ${applicantName} applied for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TalentLens</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">New Applicant Notification</p>
          </div>
          <div style="background: #f8faff; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin: 0 0 20px;">New Application Received</h2>
            <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px;">Candidate Name</td><td style="padding: 10px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${applicantName}</td></tr>
                <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email</td><td style="padding: 10px 0; color: #1d4ed8; font-size: 14px;">${applicantEmail}</td></tr>
                <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Applied For</td><td style="padding: 10px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${jobTitle}</td></tr>
                <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Time</td><td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${new Date().toLocaleString()}</td></tr>
              </table>
            </div>
            <a href="http://localhost:3000/applicants" style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">View Applicant</a>
          </div>
          <div style="background: #1e3a8a; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">TalentLens HR Intelligence Platform</p>
          </div>
        </div>
      `,
    });
    console.log("New applicant email sent successfully");
  } catch (error) {
    console.error("Email send error:", error);
  }
};

export const sendShortlistEmail = async (applicantName: string, applicantEmail: string, jobTitle: string, aiScore: number) => {
  try {
    await transporter.sendMail({
      from: `"TalentLens HR" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Candidate Shortlisted: ${applicantName} - Score ${aiScore}%`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">TalentLens</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Candidate Shortlisted</p>
          </div>
          <div style="background: #f8faff; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin: 0 0 20px;">A candidate has been shortlisted.</h2>
            <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px;">Candidate</td><td style="padding: 10px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${applicantName}</td></tr>
                <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email</td><td style="padding: 10px 0; color: #1d4ed8; font-size: 14px;">${applicantEmail}</td></tr>
                <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">Job Position</td><td style="padding: 10px 0; color: #0f172a; font-weight: bold; font-size: 14px;">${jobTitle}</td></tr>
                <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b; font-size: 14px;">AI Score</td><td style="padding: 10px 0; font-size: 16px; font-weight: bold; color: #16a34a;">${aiScore}%</td></tr>
              </table>
            </div>
            <a href="http://localhost:3000/applicants" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">View in TalentLens</a>
          </div>
          <div style="background: #166534; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">TalentLens HR Intelligence Platform</p>
          </div>
        </div>
      `,
    });
    console.log("Shortlist email sent successfully");
  } catch (error) {
    console.error("Email send error:", error);
  }
};

export const sendInterviewInvitationEmail = async (
  applicantName: string,
  applicantEmail: string,
  jobTitle: string,
  interviewDate: string,
  interviewTime: string,
  interviewType: string,
  meetingLink?: string,
  notes?: string
) => {
  try {
    const formattedDate = new Date(interviewDate).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    await transporter.sendMail({
      from: `"TalentLens HR" <${process.env.EMAIL_USER}>`,
      to: applicantEmail,
      subject: `Interview Invitation - ${jobTitle} at TalentLens`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TalentLens</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Interview Invitation</p>
          </div>

          <div style="background: #f8faff; padding: 32px; border: 1px solid #e2e8f0;">
            <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 24px;">&#127881;</span>
              <div>
                <div style="font-weight: 800; color: #15803d; font-size: 16px;">Congratulations, ${applicantName}!</div>
                <div style="color: #166534; font-size: 14px; margin-top: 4px;">You have been shortlisted for an interview.</div>
              </div>
            </div>

            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              We are pleased to invite you for an interview for the <strong>${jobTitle}</strong> position. 
              Please find your interview details below.
            </p>

            <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <h3 style="color: #0f172a; margin: 0 0 16px; font-size: 16px;">Interview Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 14px; width: 140px; border-bottom: 1px solid #f1f5f9;">Position</td>
                  <td style="padding: 12px 0; color: #0f172a; font-weight: 700; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${jobTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Date</td>
                  <td style="padding: 12px 0; color: #0f172a; font-weight: 700; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Time</td>
                  <td style="padding: 12px 0; color: #0f172a; font-weight: 700; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${interviewTime}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Format</td>
                  <td style="padding: 12px 0; color: #0f172a; font-weight: 700; font-size: 14px; border-bottom: 1px solid #f1f5f9; text-transform: capitalize;">${interviewType}</td>
                </tr>
                ${meetingLink ? `
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Meeting Link</td>
                  <td style="padding: 12px 0; font-size: 14px;"><a href="${meetingLink}" style="color: #1d4ed8; font-weight: 700;">${meetingLink}</a></td>
                </tr>` : ""}
              </table>
            </div>

            ${notes ? `
            <div style="background: #fef9c3; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
              <div style="font-weight: 700; color: #92400e; margin-bottom: 6px; font-size: 14px;">Notes from HR</div>
              <div style="color: #78350f; font-size: 14px; line-height: 1.6;">${notes}</div>
            </div>` : ""}

            <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <h3 style="color: #0f172a; margin: 0 0 12px; font-size: 15px;">Tips to prepare:</h3>
              <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Research the company and the role thoroughly</li>
                <li>Review your projects and be ready to discuss them</li>
                <li>Prepare questions to ask the interviewer</li>
                <li>Join the call 5 minutes early if it is online</li>
                <li>Have a copy of your CV ready</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="http://localhost:3000/my-application" style="display: inline-block; background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
                View My Application Status
              </a>
            </div>
          </div>

          <div style="background: #1e3a8a; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); margin: 0 0 6px; font-size: 13px;">TalentLens HR Intelligence Platform</p>
            <p style="color: rgba(255,255,255,0.4); margin: 0; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });
    console.log(`Interview invitation email sent to ${applicantEmail}`);
  } catch (error) {
    console.error("Interview email send error:", error);
  }
};

export const sendRejectionEmail = async (
  applicantName: string,
  applicantEmail: string,
  jobTitle: string
) => {
  try {
    await transporter.sendMail({
      from: `"TalentLens HR" <${process.env.EMAIL_USER}>`,
      to: applicantEmail,
      subject: `Your application for ${jobTitle} - Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TalentLens</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Application Update</p>
          </div>
          <div style="background: #f8faff; padding: 32px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; margin: 0 0 16px;">Dear ${applicantName},</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position and for your interest in joining our team.
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. This was a difficult decision as we received many strong applications.
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
              We encourage you to keep developing your skills and apply for future opportunities that match your profile. We wish you the very best in your career journey.
            </p>
            <a href="http://localhost:3000/apply" style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">View Other Opportunities</a>
          </div>
          <div style="background: #1e3a8a; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">TalentLens HR Intelligence Platform</p>
          </div>
        </div>
      `,
    });
    console.log(`Rejection email sent to ${applicantEmail}`);
  } catch (error) {
    console.error("Rejection email send error:", error);
  }
};
