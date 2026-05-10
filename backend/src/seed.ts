import mongoose from "mongoose";
import dotenv from "dotenv";
import Applicant from "./models/applicant.model";
import Job from "./models/job.model";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Job.deleteMany({});
    await Applicant.deleteMany({});
    console.log("Cleared existing data");

    // Create Jobs
    const jobs = await Job.insertMany([
      {
        title: "Senior Software Engineer",
        department: "Engineering",
        location: "Kigali, Rwanda",
        description: "We are looking for a Senior Software Engineer to join our team and build scalable web applications.",
        requiredSkills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
        experienceYears: 3,
        educationLevel: "BSc Computer Science",
        employmentType: "Full-time",
        status: "open",
      },
      {
        title: "Frontend Developer",
        department: "Engineering",
        location: "Kigali, Rwanda",
        description: "We need a talented Frontend Developer to create beautiful and responsive user interfaces.",
        requiredSkills: ["React", "TypeScript", "CSS", "Vue.js", "GraphQL"],
        experienceYears: 2,
        educationLevel: "Bachelor Degree",
        employmentType: "Full-time",
        status: "open",
      },
      {
        title: "Data Scientist",
        department: "Data",
        location: "Kigali, Rwanda",
        description: "Join our data team to analyze large datasets and build machine learning models.",
        requiredSkills: ["Python", "Machine Learning", "PostgreSQL", "Docker", "AWS"],
        experienceYears: 2,
        educationLevel: "MSc Computer Science",
        employmentType: "Full-time",
        status: "open",
      },
    ]);

    console.log(`Created ${jobs.length} jobs`);

    // Create Applicants for Job 1 - Senior Software Engineer
    const applicants1 = [
      {
        name: "Alice Uwimana",
        fullName: "Alice Uwimana",
        email: "alice@email.com",
        phone: "+250781234567",
        currentPosition: "Software Engineer",
        jobTitle: "Software Engineer",
        yearsOfExperience: 4,
        experienceYears: 4,
        educationLevel: "BSc Computer Science",
        summary: "Experienced software engineer with 4 years building web applications using React and Node.js",
        skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"],
        certifications: ["AWS Certified Developer", "Google Cloud Professional"],
        projects: ["E-commerce platform with 10k users", "Real-time chat application", "HR Management System"],
        githubUrl: "https://github.com/alice",
        portfolioUrl: "https://alice.dev",
        jobId: jobs[0]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "Bob Nkurunziza",
        fullName: "Bob Nkurunziza",
        email: "bob@email.com",
        phone: "+250782345678",
        currentPosition: "Junior Developer",
        jobTitle: "Junior Developer",
        yearsOfExperience: 1,
        experienceYears: 1,
        educationLevel: "Bachelor Degree",
        summary: "Junior developer passionate about learning new technologies",
        skills: ["React", "JavaScript", "CSS"],
        certifications: [],
        projects: ["Personal portfolio website"],
        githubUrl: "https://github.com/bob",
        portfolioUrl: "",
        jobId: jobs[0]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "Claire Mukamana",
        fullName: "Claire Mukamana",
        email: "claire@email.com",
        phone: "+250783456789",
        currentPosition: "Full Stack Developer",
        jobTitle: "Full Stack Developer",
        yearsOfExperience: 3,
        experienceYears: 3,
        educationLevel: "BSc Software Engineering",
        summary: "Full stack developer with strong experience in React and Node.js building production applications",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
        certifications: ["AWS Solutions Architect"],
        projects: ["Banking dashboard application", "Food delivery platform", "School management system"],
        githubUrl: "https://github.com/claire",
        portfolioUrl: "https://claire.dev",
        jobId: jobs[0]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "David Habimana",
        fullName: "David Habimana",
        email: "david@email.com",
        phone: "+250784567890",
        currentPosition: "Backend Engineer",
        jobTitle: "Backend Engineer",
        yearsOfExperience: 5,
        experienceYears: 5,
        educationLevel: "MSc Computer Science",
        summary: "Senior backend engineer with expertise in building scalable APIs and microservices",
        skills: ["Node.js", "TypeScript", "MongoDB", "AWS", "Docker", "Kubernetes", "Redis"],
        certifications: ["AWS Certified Solutions Architect", "Docker Certified Associate", "Google Cloud Professional"],
        projects: ["Microservices architecture for fintech", "Real-time analytics platform", "API gateway for 1M requests/day"],
        githubUrl: "https://github.com/david",
        portfolioUrl: "https://david.dev",
        jobId: jobs[0]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "Eve Ishimwe",
        fullName: "Eve Ishimwe",
        email: "eve@email.com",
        phone: "+250785678901",
        currentPosition: "Software Developer",
        jobTitle: "Software Developer",
        yearsOfExperience: 2,
        experienceYears: 2,
        educationLevel: "BSc Information Technology",
        summary: "Software developer with 2 years experience in web development",
        skills: ["React", "Node.js", "MongoDB", "Git"],
        certifications: ["Meta Frontend Developer Certificate"],
        projects: ["Hospital management system", "Online voting platform"],
        githubUrl: "https://github.com/eve",
        portfolioUrl: "",
        jobId: jobs[0]._id,
        source: "external",
        status: "submitted",
      },
    ];

    // Create Applicants for Job 2 - Frontend Developer
    const applicants2 = [
      {
        name: "Frank Niyomugabo",
        fullName: "Frank Niyomugabo",
        email: "frank@email.com",
        phone: "+250786789012",
        currentPosition: "UI Developer",
        jobTitle: "UI Developer",
        yearsOfExperience: 3,
        experienceYears: 3,
        educationLevel: "Bachelor Degree",
        summary: "Creative frontend developer specializing in building beautiful user interfaces",
        skills: ["React", "TypeScript", "CSS", "Vue.js", "GraphQL", "Figma"],
        certifications: ["Meta Frontend Developer", "Google UX Design"],
        projects: ["Design system for 50 components", "E-learning platform UI", "Mobile-first dashboard"],
        githubUrl: "https://github.com/frank",
        portfolioUrl: "https://frank.design",
        jobId: jobs[1]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "Grace Uwamariya",
        fullName: "Grace Uwamariya",
        email: "grace@email.com",
        phone: "+250787890123",
        currentPosition: "Frontend Developer",
        jobTitle: "Frontend Developer",
        yearsOfExperience: 2,
        experienceYears: 2,
        educationLevel: "BSc Computer Science",
        summary: "Frontend developer passionate about creating accessible and responsive web applications",
        skills: ["React", "TypeScript", "CSS", "GraphQL"],
        certifications: ["AWS Cloud Practitioner"],
        projects: ["Healthcare portal", "Real estate listing platform"],
        githubUrl: "https://github.com/grace",
        portfolioUrl: "",
        jobId: jobs[1]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "Henry Mugisha",
        fullName: "Henry Mugisha",
        email: "henry@email.com",
        phone: "+250788901234",
        currentPosition: "Web Developer",
        jobTitle: "Web Developer",
        yearsOfExperience: 1,
        experienceYears: 1,
        educationLevel: "Diploma",
        summary: "Self-taught web developer with passion for frontend development",
        skills: ["React", "CSS", "JavaScript"],
        certifications: [],
        projects: ["Personal blog", "Weather app"],
        githubUrl: "https://github.com/henry",
        portfolioUrl: "",
        jobId: jobs[1]._id,
        source: "external",
        status: "submitted",
      },
    ];

    // Create Applicants for Job 3 - Data Scientist
    const applicants3 = [
      {
        name: "Iris Uwase",
        fullName: "Iris Uwase",
        email: "iris@email.com",
        phone: "+250789012345",
        currentPosition: "Data Analyst",
        jobTitle: "Data Analyst",
        yearsOfExperience: 3,
        experienceYears: 3,
        educationLevel: "MSc Computer Science",
        summary: "Data scientist with strong background in machine learning and statistical analysis",
        skills: ["Python", "Machine Learning", "PostgreSQL", "Docker", "AWS", "TensorFlow"],
        certifications: ["Google Data Analytics", "AWS Machine Learning Specialty", "TensorFlow Developer"],
        projects: ["Customer churn prediction model", "NLP sentiment analysis tool", "Sales forecasting system"],
        githubUrl: "https://github.com/iris",
        portfolioUrl: "https://iris-data.com",
        jobId: jobs[2]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "James Bizimana",
        fullName: "James Bizimana",
        email: "james@email.com",
        phone: "+250780123456",
        currentPosition: "Junior Data Scientist",
        jobTitle: "Junior Data Scientist",
        yearsOfExperience: 1,
        experienceYears: 1,
        educationLevel: "BSc Computer Science",
        summary: "Junior data scientist eager to apply machine learning to solve real business problems",
        skills: ["Python", "PostgreSQL", "Machine Learning"],
        certifications: ["Google Data Analytics"],
        projects: ["Housing price prediction", "Image classification model"],
        githubUrl: "https://github.com/james",
        portfolioUrl: "",
        jobId: jobs[2]._id,
        source: "external",
        status: "submitted",
      },
      {
        name: "Karen Ineza",
        fullName: "Karen Ineza",
        email: "karen@email.com",
        phone: "+250781234560",
        currentPosition: "Data Engineer",
        jobTitle: "Data Engineer",
        yearsOfExperience: 4,
        experienceYears: 4,
        educationLevel: "MSc Computer Science",
        summary: "Experienced data engineer with strong skills in building data pipelines and ML models",
        skills: ["Python", "Machine Learning", "PostgreSQL", "Docker", "AWS", "Spark", "Airflow"],
        certifications: ["AWS Data Analytics", "Google Professional Data Engineer", "Databricks Certified"],
        projects: ["Real-time data pipeline processing 1M events/day", "ML model serving platform", "Data warehouse migration"],
        githubUrl: "https://github.com/karen",
        portfolioUrl: "https://karen.io",
        jobId: jobs[2]._id,
        source: "external",
        status: "submitted",
      },
    ];

    const allApplicants = [...applicants1, ...applicants2, ...applicants3];
    await Applicant.insertMany(allApplicants);
    console.log(`Created ${allApplicants.length} applicants`);
    console.log("Seed complete! You can now test the full flow.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
